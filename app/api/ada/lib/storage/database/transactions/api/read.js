// @flow

import type {
  lf$Database,
  lf$Predicate,
  lf$schema$Table,
  lf$Transaction,
  lf$query$Select,
} from 'lovefield';
import lf, {
  op,
} from 'lovefield';
import { groupBy, } from 'lodash';

import * as Tables from '../tables';
import type {
  TransactionRow,
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
  TxStatusCodesType,
  DbTxIO,
} from '../tables';
import { BlockSchema } from '../../uncategorized/tables';
import type { BlockRow } from '../../uncategorized/tables';
import { getRowIn, } from '../../utils';

export class GetTransaction {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
  });
  static depTables = Object.freeze({});

  static async fromIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<TransactionRow>>> {
    return await getRowIn<TransactionRow>(
      db, tx,
      GetTransaction.ownTables[Tables.TransactionSchema.name].name,
      GetTransaction.ownTables[Tables.TransactionSchema.name].properties.TransactionId,
      request.ids,
    );
  }

  static async withStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      status: Array<TxStatusCodesType>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<TransactionRow>>> {
    const txTableMeta = GetTransaction.ownTables[Tables.TransactionSchema.name];
    const txTable = db.getSchema().table(
      txTableMeta.name
    );
    const query = db
      .select()
      .from(txTable)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Status].in(request.status),
      ));
    return await tx.attach(query);
  }

  static async byDigest(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      digests: Array<number>,
    },
  ): Promise<Map<string, $ReadOnly<TransactionRow>>> {
    const txTableMeta = GetTransaction.ownTables[Tables.TransactionSchema.name];
    const txTable = db.getSchema().table(
      txTableMeta.name
    );
    const query = db
      .select()
      .from(txTable)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Digest].in(request.digests),
      ));
    const rows: $ReadOnlyArray<$ReadOnly<TransactionRow>> = await tx.attach(query);

    const mapToTx = new Map();
    for (const row of rows) {
      mapToTx.set(row.Hash, row);
    }
    return mapToTx;
  }
}

export class GetTxAndBlock {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [BlockSchema.name]: BlockSchema,
  });
  static depTables = Object.freeze({});

  static async gteSlot(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      slot: number,
    },
  ): Promise<$ReadOnlyArray<{|
    Block: $ReadOnly<BlockRow>,
    Transaction: $ReadOnly<TransactionRow>,
  |}>> {
    const txTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.TransactionSchema.name].name
    );
    const blockTable = db.getSchema().table(
      GetTxAndBlock.ownTables[BlockSchema.name].name
    );
    const query = db.select()
      .from(txTable)
      .innerJoin(
        blockTable,
        txTable[Tables.TransactionSchema.properties.BlockId].eq(
          blockTable[BlockSchema.properties.BlockId]
        )
      )
      .where(op.and(
        blockTable[BlockSchema.properties.SlotNum].gte(request.slot),
        txTable[Tables.TransactionSchema.properties.TransactionId].in(request.txIds)
      ));

    const queryResult: $ReadOnlyArray<{|
      Block: $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}> = await tx.attach(query);

    return queryResult;
  }

  static async firstTxBefore(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      slot: number,
    },
  ): Promise<void | {|
    Block: $ReadOnly<BlockRow>,
    Transaction: $ReadOnly<TransactionRow>,
  |}> {
    const txTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.TransactionSchema.name].name
    );
    const blockTable = db.getSchema().table(
      GetTxAndBlock.ownTables[BlockSchema.name].name
    );
    const query = db.select()
      .from(txTable)
      .innerJoin(
        blockTable,
        txTable[Tables.TransactionSchema.properties.BlockId].eq(
          blockTable[BlockSchema.properties.BlockId]
        )
      )
      .orderBy(blockTable[BlockSchema.properties.SlotNum], lf.Order.DESC)
      .where(op.and(
        blockTable[BlockSchema.properties.SlotNum].lt(request.slot),
        txTable[Tables.TransactionSchema.properties.TransactionId].in(request.txIds)
      ))
      .limit(1);

    const queryResult: $ReadOnlyArray<{|
      Block: $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}> = await tx.attach(query);

    if (queryResult.length === 0) {
      return undefined;
    }
    return queryResult[0];
  }

  static async byTime(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      skip?: number,
      limit?: number,
    },
  ): Promise<$ReadOnlyArray<{
    Transaction: $ReadOnly<TransactionRow>,
    Block: null | $ReadOnly<BlockRow>
  }>> {
    const txTableMeta = GetTxAndBlock.ownTables[Tables.TransactionSchema.name];
    const blockTableMeta = GetTxAndBlock.ownTables[BlockSchema.name];
    const txTable = db.getSchema().table(txTableMeta.name);
    const blockTable = db.getSchema().table(blockTableMeta.name);
    const query = db
      .select()
      .from(txTable)
      .leftOuterJoin(
        blockTable,
        txTable[txTableMeta.properties.BlockId].eq(
          blockTable[blockTableMeta.properties.BlockId]
        )
      )
      .orderBy(txTable[txTableMeta.properties.LastUpdateTime], lf.Order.DESC)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
      ));
    if (request.limit != null) {
      query.limit(request.limit);
    }
    if (request.skip != null) {
      query.skip(request.skip);
    }
    return await tx.attach(query);
  }

  static async withStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txIds: Array<number>,
      status: Array<TxStatusCodesType>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<TransactionRow>>> {
    const txTableMeta = GetTxAndBlock.ownTables[Tables.TransactionSchema.name];
    const blockTableMeta = GetTxAndBlock.ownTables[BlockSchema.name];
    const txTable = db.getSchema().table(txTableMeta.name);
    const blockTable = db.getSchema().table(blockTableMeta.name);
    const query = db
      .select()
      .from(txTable)
      .leftOuterJoin(
        blockTable,
        txTable[txTableMeta.properties.BlockId].eq(
          blockTable[blockTableMeta.properties.BlockId]
        )
      )
      .orderBy(txTable[txTableMeta.properties.LastUpdateTime], lf.Order.DESC)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Status].in(request.status),
      ));
    return await tx.attach(query);
  }
}

export class GetUtxoInputs {
  static ownTables = Object.freeze({
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
  });
  static depTables = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>> {
    return await getRowIn<UtxoTransactionInputRow>(
      db, tx,
      GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name].name,
      GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name].properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>> {
    return await getRowIn<UtxoTransactionInputRow>(
      db, tx,
      GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name].name,
      GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name].properties.TransactionId,
      request.ids,
    );
  }
}

export class GetUtxoOutputs {
  static ownTables = Object.freeze({
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>> {
    return await getRowIn<UtxoTransactionOutputRow>(
      db, tx,
      GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name].name,
      GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name].properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      ids: Array<number>,
    },
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>> {
    return await getRowIn<UtxoTransactionOutputRow>(
      db, tx,
      GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name].name,
      GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name].properties.TransactionId,
      request.ids,
    );
  }
}

export type UtxoTxOutput = {
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
};
export class GetUtxoTxOutputsWithTx {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables = Object.freeze({});

  static baseQuery(
    db: lf$Database,
    predicate: (txTable: lf$schema$Table, outputTable: lf$schema$Table) => lf$Predicate,
  ) {
    const txTable = db.getSchema().table(
      GetUtxoTxOutputsWithTx.ownTables[Tables.TransactionSchema.name].name
    );
    const outputTable = db.getSchema().table(
      GetUtxoTxOutputsWithTx.ownTables[Tables.UtxoTransactionOutputSchema.name].name
    );

    return db.select()
      .from(txTable)
      .innerJoin(
        outputTable,
        txTable[Tables.TransactionSchema.properties.TransactionId].eq(
          outputTable[Tables.UtxoTransactionOutputSchema.properties.TransactionId]
        )
      )
      .where(predicate(txTable, outputTable));
  }

  static async getSingleOutput(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txId: number,
      outputIndex: number,
    },
  ): Promise<void | $ReadOnly<UtxoTxOutput>> {
    const query = GetUtxoTxOutputsWithTx.baseQuery(
      db,
      (txTable, outputTable) => op.and(
        txTable[Tables.TransactionSchema.properties.TransactionId].eq(request.txId),
        outputTable[Tables.UtxoTransactionOutputSchema.properties.OutputIndex].eq(
          request.outputIndex
        ),
      )
    );

    const queryResult: $ReadOnlyArray<{
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    }> = await tx.attach(query);

    if (queryResult.length === 0) {
      return undefined;
    }
    return queryResult[0];
  }

  static async getUtxo(
    db: lf$Database,
    tx: lf$Transaction,
    addressDerivationIds: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTxOutput>>> {
    const query = GetUtxoTxOutputsWithTx.baseQuery(
      db,
      (txTable, outputTable) => op.and(
        txTable[Tables.TransactionSchema.properties.Status].eq(Tables.TxStatusCodes.IN_BLOCK),
        outputTable[Tables.UtxoTransactionOutputSchema.properties.IsUnspent].eq(true),
        outputTable[Tables.UtxoTransactionOutputSchema.properties.AddressId].in(
          addressDerivationIds
        ),
      )
    );

    return await tx.attach(query);
  }

  static async getOutputsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    addressDerivationIds: Array<number>,
    status: $ReadOnlyArray<TxStatusCodesType>,
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTxOutput>>> {
    const query = GetUtxoTxOutputsWithTx.baseQuery(
      db,
      (txTable, outputTable) => op.and(
        txTable[Tables.TransactionSchema.properties.Status].in(status),
        outputTable[Tables.UtxoTransactionOutputSchema.properties.AddressId].in(
          addressDerivationIds
        ),
      )
    );

    return await tx.attach(query);
  }
}

export type UtxoTxInput = {
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionInput: $ReadOnly<UtxoTransactionInputRow>,
};
export class GetUtxoTxInputsWithTx {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
  });
  static depTables = Object.freeze({});

  static baseQuery(
    db: lf$Database,
    predicate: (txTable: lf$schema$Table, outputTable: lf$schema$Table) => lf$Predicate,
  ): lf$query$Select {
    const txTable = db.getSchema().table(
      GetUtxoTxInputsWithTx.ownTables[Tables.TransactionSchema.name].name
    );
    const outputTable = db.getSchema().table(
      GetUtxoTxInputsWithTx.ownTables[Tables.UtxoTransactionInputSchema.name].name
    );

    return db.select()
      .from(txTable)
      .innerJoin(
        outputTable,
        txTable[Tables.TransactionSchema.properties.TransactionId].eq(
          outputTable[Tables.UtxoTransactionInputSchema.properties.TransactionId]
        )
      )
      .where(predicate(txTable, outputTable));
  }

  static async getInputsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    addressDerivationIds: Array<number>,
    status: Array<TxStatusCodesType>,
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTxInput>>> {
    const query = GetUtxoTxInputsWithTx.baseQuery(
      db,
      (txTable, outputTable) => op.and(
        txTable[Tables.TransactionSchema.properties.Status].in(status),
        outputTable[Tables.UtxoTransactionInputSchema.properties.AddressId].in(
          addressDerivationIds
        ),
      )
    );

    return await tx.attach(query);
  }
}

export class AssociateTxWithUtxoIOs {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetUtxoInputs,
    GetUtxoOutputs,
  });

  static async getTxIdsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      addressIds: Array<number>,
    },
  ): Promise<Array<number>> {
    const inputsForAddresses = await AssociateTxWithUtxoIOs.depTables.GetUtxoInputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    const outputForAddresses = await AssociateTxWithUtxoIOs.depTables.GetUtxoOutputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    return Array.from(new Set([
      ...inputsForAddresses.map(input => input.TransactionId),
      ...outputForAddresses.map(output => output.TransactionId),
    ]));
  }

  static async mergeTxWithIO(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>,
    },
  ): Promise<Array<DbTxIO>> {
    const ids = request.txs.map(transaction => transaction.TransactionId);

    const inputsForTxs = await AssociateTxWithUtxoIOs.depTables.GetUtxoInputs.fromTxIds(
      db, tx,
      { ids },
    );
    const outputsForTxs = await AssociateTxWithUtxoIOs.depTables.GetUtxoOutputs.fromTxIds(
      db, tx,
      { ids },
    );

    const groupedInput = groupBy(
      inputsForTxs,
      input => input.TransactionId,
    );
    const groupedOutput = groupBy(
      outputsForTxs,
      output => output.TransactionId,
    );

    return request.txs.map(transaction => ({
      transaction,
      utxoInputs: groupedInput[transaction.TransactionId] || [],
      utxoOutputs: groupedOutput[transaction.TransactionId] || [],
    }));
  }
}
