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
  DbUtxoInputs, DbUtxoOutputs,
} from '../tables';
import { TransactionSchema, } from '../../../primitives/tables';
import { AssociateToken } from '../../../primitives/api/read';
import { TxStatusCodes } from '../../../primitives/enums';
import type {
  TransactionRow,
  TokenRow,
  TokenListRow,
} from '../../../primitives/tables';
import type { TxStatusCodesType } from '../../../primitives/enums';
import { getRowIn, } from '../../../utils';

async function addTokenInfoToOutput<T>(
  db: lf$Database,
  tx: lf$Transaction,
  rows: $ReadOnlyArray<T>,
  getListId: T => number,
  networkId: number
): Promise<Array<{|
  ...T,
  tokens: $ReadOnlyArray<{|
    TokenList: $ReadOnly<TokenListRow>,
    Token: $ReadOnly<TokenRow>,
  |}>
|}>> {
  const tokenInfo = await GetUtxoTxInputsWithTx.depTables.AssociateToken.join(
    db, tx,
    {
      listIds: rows.map(row => getListId(row)),
      networkId,
    }
  );

  const result = [];
  for (const row of rows) {
    const newEntry = { ...row, tokens: [] };
    for (const token of tokenInfo) {
      if (token.TokenList.ListId === getListId(row)) {
        newEntry.tokens.push(token);
      }
    }
    result.push(newEntry);
  }

  return result;
}

export class GetUtxoInputs {
  static ownTables: {|
    UtxoTransactionInput: typeof Tables.UtxoTransactionInputSchema,
  |} = Object.freeze({
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| ids: Array<number>, |},
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>> {
    const table = GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name];
    return await getRowIn<UtxoTransactionInputRow>(
      db, tx,
      table.name,
      table.properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| ids: Array<number>, |},
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>> {
    const table = GetUtxoInputs.ownTables[Tables.UtxoTransactionInputSchema.name];
    return await getRowIn<UtxoTransactionInputRow>(
      db, tx,
      table.name,
      table.properties.TransactionId,
      request.ids,
    );
  }
}

export class GetUtxoOutputs {
  static ownTables: {|
    UtxoTransactionOutput: typeof Tables.UtxoTransactionOutputSchema,
  |} = Object.freeze({
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async fromAddressIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| ids: Array<number>, |},
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>> {
    const table = GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name];
    return await getRowIn<UtxoTransactionOutputRow>(
      db, tx,
      table.name,
      table.properties.AddressId,
      request.ids,
    );
  }

  static async fromTxIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| ids: Array<number>, |},
  ): Promise<$ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>> {
    const table = GetUtxoOutputs.ownTables[Tables.UtxoTransactionOutputSchema.name];
    return await getRowIn<UtxoTransactionOutputRow>(
      db, tx,
      table.name,
      table.properties.TransactionId,
      request.ids,
    );
  }
}

export type UtxoTxOutput = {|
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
  tokens: $ReadOnlyArray<{|
    TokenList: $ReadOnly<TokenListRow>,
    Token: $ReadOnly<TokenRow>,
  |}>
|};
export class GetUtxoTxOutputsWithTx {
  static ownTables: {|
    Transaction: typeof TransactionSchema,
    UtxoTransactionOutput: typeof Tables.UtxoTransactionOutputSchema,
  |} = Object.freeze({
    [TransactionSchema.name]: TransactionSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables: {||} = Object.freeze({});

  static baseQuery(
    db: lf$Database,
    predicate: (txTable: lf$schema$Table, outputTable: lf$schema$Table) => lf$Predicate,
  ): lf$query$Select {
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
    request: {|
      txId: number,
      outputIndex: number,
      networkId: number,
    |},
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

    const outputInfo: $ReadOnlyArray<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}> = await tx.attach(query);

    if (outputInfo.length === 0) {
      return undefined;
    }
    return (await addTokenInfoToOutput<$ReadOnly<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}>>(
      db, tx,
      outputInfo,
      row => row.UtxoTransactionOutput.TokenListId,
      request.networkId
    ))[0]
  }

  static async getUtxo(
    db: lf$Database,
    tx: lf$Transaction,
    addressDerivationIds: Array<number>,
    networkId: number,
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

    const outputInfo: $ReadOnlyArray<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}> = await tx.attach(query);

    return await addTokenInfoToOutput<$ReadOnly<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}>>(
      db, tx,
      outputInfo,
      row => row.UtxoTransactionOutput.TokenListId,
      networkId
    );
  }

  static async getOutputsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    addressDerivationIds: Array<number>,
    status: $ReadOnlyArray<TxStatusCodesType>,
    networkId: number,
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

    const outputInfo: $ReadOnlyArray<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}> = await tx.attach(query);

    return await addTokenInfoToOutput<$ReadOnly<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
    |}>>(
      db, tx,
      outputInfo,
      row => row.UtxoTransactionOutput.TokenListId,
      networkId
    );
  }
}

export type UtxoTxInput = {|
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionInput: $ReadOnly<UtxoTransactionInputRow>,
  tokens: $ReadOnlyArray<{|
    TokenList: $ReadOnly<TokenListRow>,
    Token: $ReadOnly<TokenRow>,
  |}>
|};
export class GetUtxoTxInputsWithTx {
  static ownTables: {|
    Transaction: typeof TransactionSchema,
    UtxoTransactionInput: typeof Tables.UtxoTransactionInputSchema,
  |} = Object.freeze({
    [TransactionSchema.name]: TransactionSchema,
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
  });
  static depTables: {|
    AssociateToken: typeof AssociateToken,
  |} = Object.freeze({
    AssociateToken
  });

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
    networkId: number,
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

    const inputInfo: $ReadOnlyArray<$ReadOnly<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionInput: $ReadOnly<UtxoTransactionInputRow>,
    |}>> = await tx.attach(query);

    return await addTokenInfoToOutput<$ReadOnly<{|
      Transaction: $ReadOnly<TransactionRow>,
      UtxoTransactionInput: $ReadOnly<UtxoTransactionInputRow>,
    |}>>(
      db, tx,
      inputInfo,
      row => row.UtxoTransactionInput.TokenListId,
      networkId
    );
  }
}

export class AssociateTxWithUtxoIOs {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    GetUtxoInputs: typeof GetUtxoInputs,
    GetUtxoOutputs: typeof GetUtxoOutputs,
  |} = Object.freeze({
    GetUtxoInputs,
    GetUtxoOutputs,
  });

  static async getTxIdsForAddresses(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| addressIds: Array<number>, |},
  ): Promise<Array<number>> {
    const ins = await AssociateTxWithUtxoIOs.depTables.GetUtxoInputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    const outs = await AssociateTxWithUtxoIOs.depTables.GetUtxoOutputs.fromAddressIds(
      db, tx,
      { ids: request.addressIds },
    );
    return Array.from(new Set([
      ...ins.map(input => input.TransactionId),
      ...outs.map(output => output.TransactionId),
    ]));
  }

  static async getIOsForTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| txs: $ReadOnlyArray<$ReadOnly<TransactionRow>>, |},
  ): Promise<Map<$ReadOnly<TransactionRow>, {| ...DbUtxoInputs, ...DbUtxoOutputs, |}>> {
    const ids = request.txs.map(transaction => transaction.TransactionId);

    const inputs = await AssociateTxWithUtxoIOs.depTables.GetUtxoInputs.fromTxIds(
      db, tx,
      { ids },
    );
    const outputs = await AssociateTxWithUtxoIOs.depTables.GetUtxoOutputs.fromTxIds(
      db, tx,
      { ids },
    );

    const groupedInput = groupBy(
      inputs,
      input => input.TransactionId,
    );
    const groupedOutput = groupBy(
      outputs,
      output => output.TransactionId,
    );

    const txMap = new Map();
    for (const transaction of request.txs) {
      txMap.set(transaction, {
        utxoInputs: groupedInput[transaction.TransactionId] || [],
        utxoOutputs: groupedOutput[transaction.TransactionId] || [],
      });
    }
    return txMap;
  }
}

/**
 * returns a function that gives you the next ID for a token list
 * starting from the last spot saved to the DB
 */
export async function createTokenListIdGenFunction(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    AssociateToken: Class<AssociateToken>,
  |}
): Promise<void => number> {
  let nextId = await deps.AssociateToken.nextTokenListId(db, dbTx);

  return () => {
    const next = nextId;
    nextId++;
    return next;
  }
}
