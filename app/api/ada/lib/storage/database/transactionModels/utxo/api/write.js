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
  UtxoTransactionInputInsert, UtxoTransactionInputRow,
  UtxoTransactionOutputInsert, UtxoTransactionOutputRow,
  DbUtxoInputs, DbUtxoOutputs,
} from '../tables';
import type {
  TransactionRow,
} from '../../../primitives/tables';

import {
  addBatchToTable,
} from '../../../utils';

import {
  GetUtxoTxOutputsWithTx,
} from './read';


export type MarkAsRequest = {|
  txId: number,
  outputIndex: number,
  isUnspent: boolean,
|};
export type MarkAsResponse = void | {|
  Transaction: $ReadOnly<TransactionRow>,
  UtxoTransactionOutput: $ReadOnly<UtxoTransactionOutputRow>,
|};
export class MarkUtxo {
  static ownTables: {|
    UtxoTransactionOutput: typeof Tables.UtxoTransactionOutputSchema,
  |} = Object.freeze({
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables: {|GetUtxoTxOutputsWithTx: typeof GetUtxoTxOutputsWithTx|} = Object.freeze({
    GetUtxoTxOutputsWithTx
  });

  static async markAs(
    db: lf$Database,
    tx: lf$Transaction,
    request: MarkAsRequest,
  ): Promise<MarkAsResponse> {
    const output = await MarkUtxo.depTables.GetUtxoTxOutputsWithTx.getSingleOutput(
      db, tx,
      {
        txId: request.txId,
        outputIndex: request.outputIndex,
      },
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

export class ModifyUtxoTransaction {
  static ownTables: {|
    UtxoTransactionInput: typeof Tables.UtxoTransactionInputSchema,
    UtxoTransactionOutput: typeof Tables.UtxoTransactionOutputSchema,
  |} = Object.freeze({
    [Tables.UtxoTransactionInputSchema.name]: Tables.UtxoTransactionInputSchema,
    [Tables.UtxoTransactionOutputSchema.name]: Tables.UtxoTransactionOutputSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async addIOsToTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      utxoInputs: Array<UtxoTransactionInputInsert>,
      utxoOutputs: Array<UtxoTransactionOutputInsert>,
    |},
  ): Promise<{| ...DbUtxoInputs, ...DbUtxoOutputs, |}> {
    const { utxoInputs, utxoOutputs } = request;
    const newInputs = await addBatchToTable<
      UtxoTransactionInputInsert,
      UtxoTransactionInputRow
    >(
      db, tx,
      utxoInputs,
      ModifyUtxoTransaction.ownTables[Tables.UtxoTransactionInputSchema.name].name
    );
    const newOutputs = await addBatchToTable<
      UtxoTransactionOutputInsert,
      UtxoTransactionOutputRow
    >(
      db, tx,
      utxoOutputs,
      ModifyUtxoTransaction.ownTables[Tables.UtxoTransactionOutputSchema.name].name
    );

    return {
      utxoInputs: newInputs,
      utxoOutputs: newOutputs,
    };
  }
}
