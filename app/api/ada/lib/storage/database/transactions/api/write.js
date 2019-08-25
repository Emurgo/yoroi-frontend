// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  TransactionInsert, TransactionRow,
  UtxoTransactionInputInsert, UtxoTransactionInputRow,
  UtxoTransactionOutputInsert, UtxoTransactionOutputRow,
  TxStatusCodesType,
  DbTransaction, DbTxIO,
} from '../tables';
import type {
  BlockInsert, DbBlock,
} from '../../uncategorized/tables';
import {
  GetOrAddBlock
} from '../../uncategorized/api/write';

import {
  addNewRowToTable,
  addOrReplaceRow,
  addBatchToTable,
} from '../../utils';

import {
  GetTransaction,
  GetUtxoTxOutputsWithTx,
} from './read';


export type MarkAsRequest = {
  txId: number,
  outputIndex: number,
  isUnspent: boolean,
};
export type MarkAsResponse = void | {|
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
|};
export class MarkUtxo {
  static ownTables = Object.freeze({
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables = Object.freeze({
    GetUtxoTxOutputsWithTx
  });

  static async markAs(
    db: lf$Database,
    tx: lf$Transaction,
    request: MarkAsRequest,
  ): Promise<MarkAsResponse> {
    const output = await MarkUtxo.depTables.GetUtxoTxOutputsWithTx.getSingleOutput(
      db, tx,
      request,
    );
    if (output === undefined) {
      return undefined;
    }
    const outputTable = db.getSchema().table(
      MarkUtxo.ownTables[Tables.UtxoTransactionOutputSchema.name].name
    );

    const query = db
      .update(outputTable)
      .set(
        outputTable[Tables.UtxoTransactionOutputSchema.properties.IsUnspent],
        request.isUnspent
      )
      .where(op.and(
        outputTable[Tables.UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId].eq(
          output.UtxoTransactionOutput.UtxoTransactionOutputId
        ),
      ));

    await tx.attach(query);

    return {
      ...output,
      UtxoTransactionOutput: {
        ...output.UtxoTransactionOutput,
        IsUnspent: false,
      }
    };
  }
}

export class ModifyTransaction {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables = Object.freeze({
    GetOrAddBlock,
    GetTransaction,
    MarkUtxo,
  });

  static async addNew(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
      ioGen: (txRowId: number) => {|
        utxoInputs: Array<UtxoTransactionInputInsert>,
        utxoOutputs: Array<UtxoTransactionOutputInsert>,
      |},
    },
  ): Promise<{| ...WithNullableFields<DbBlock>, ...DbTxIO |}> {
    const block = request.block !== null
      ? await ModifyTransaction.depTables.GetOrAddBlock.getOrAdd(
        db, tx,
        request.block,
      )
      : null;

    const transaction = await addNewRowToTable<TransactionInsert, TransactionRow>(
      db, tx,
      request.transaction(block != null ? block.BlockId : null),
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );

    const { utxoInputs, utxoOutputs } = request.ioGen(transaction.TransactionId);
    const newInputs = await addBatchToTable<UtxoTransactionInputInsert, UtxoTransactionInputRow>(
      db, tx,
      utxoInputs,
      ModifyTransaction.ownTables[Tables.UtxoTransactionInputSchema.name].name
    );
    const newOutputs = await addBatchToTable<UtxoTransactionOutputInsert, UtxoTransactionOutputRow>(
      db, tx,
      utxoOutputs,
      ModifyTransaction.ownTables[Tables.UtxoTransactionOutputSchema.name].name
    );

    return {
      block,
      transaction,
      utxoInputs: newInputs,
      utxoOutputs: newOutputs,
    };
  }

  /**
     * Transaction may already exist in our DB and simlpy switching status
     * ex: Successful -> rollback
     *
     * tx inputs & outputs stay constant even if status changes (since txhash is same)
     * so we don't modify them.
     * Notably, we don't remove them so we can still show input+output for failed txs, etc.
     */
  static async updateExisting(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionRow,
    },
  ): Promise<{| ...WithNullableFields<DbBlock>, ...DbTransaction |}> {
    const block = request.block !== null
      ? await ModifyTransaction.depTables.GetOrAddBlock.getOrAdd(
        db, tx,
        request.block,
      )
      : null;

    // replace existing row so it gets updated status and updated block info
    const newTx = await addOrReplaceRow<TransactionRow, TransactionRow>(
      db, tx,
      request.transaction(block != null ? block.BlockId : null),
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );

    return {
      block,
      transaction: newTx,
    };
  }

  static async updateStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      status: TxStatusCodesType,
      transaction: $ReadOnly<TransactionRow>,
    },
  ): Promise<void> {
    await addOrReplaceRow<$ReadOnly<TransactionRow>, TransactionRow>(
      db, tx,
      {
        ...request.transaction,
        Status: request.status,
      },
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );
  }
}
