// @flow

import type {
  lf$Database,
  lf$Predicate,
  lf$schema$Table,
  lf$Transaction,
  lf$query$Select,
} from 'lovefield';
import {
  op,
} from 'lovefield';
import { groupBy, } from 'lodash';

import * as Tables from '../tables';
import type {
  UtxoTransactionInputRow,
  UtxoTransactionOutputRow,
  DbTxIO,
} from '../tables';
import { TxStatusCodes, TransactionSchema, } from '../../primitives/tables';
import type {
  TxStatusCodesType,
  TransactionRow,
} from '../../primitives/tables';
import { getRowIn, } from '../../utils';

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
    [TransactionSchema.name]: TransactionSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables = Object.freeze({});

  static baseQuery(
    db: lf$Database,
    predicate: (txTable: lf$schema$Table, outputTable: lf$schema$Table) => lf$Predicate,
  ) {
    const txTable = db.getSchema().table(
      GetUtxoTxOutputsWithTx.ownTables[TransactionSchema.name].name
    );
    const outputTable = db.getSchema().table(
      GetUtxoTxOutputsWithTx.ownTables[Tables.UtxoTransactionOutputSchema.name].name
    );

    return db.select()
      .from(txTable)
      .innerJoin(
        outputTable,
        txTable[TransactionSchema.properties.TransactionId].eq(
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
        txTable[TransactionSchema.properties.TransactionId].eq(request.txId),
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
        txTable[TransactionSchema.properties.Status].eq(TxStatusCodes.IN_BLOCK),
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
        txTable[TransactionSchema.properties.Status].in(status),
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
    [TransactionSchema.name]: TransactionSchema,
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
  });
  static depTables = Object.freeze({});

  static baseQuery(
    db: lf$Database,
    predicate: (txTable: lf$schema$Table, outputTable: lf$schema$Table) => lf$Predicate,
  ): lf$query$Select {
    const txTable = db.getSchema().table(
      GetUtxoTxInputsWithTx.ownTables[TransactionSchema.name].name
    );
    const outputTable = db.getSchema().table(
      GetUtxoTxInputsWithTx.ownTables[Tables.UtxoTransactionInputSchema.name].name
    );

    return db.select()
      .from(txTable)
      .innerJoin(
        outputTable,
        txTable[TransactionSchema.properties.TransactionId].eq(
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
        txTable[TransactionSchema.properties.Status].in(status),
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
