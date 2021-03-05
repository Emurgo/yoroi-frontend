// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  AccountingTransactionInputInsert, AccountingTransactionInputRow,
  AccountingTransactionOutputInsert, AccountingTransactionOutputRow,
  DbAccountingInputs, DbAccountingOutputs,
} from '../tables';

import {
  addBatchToTable,
} from '../../../utils';


export class ModifyAccountingTransaction {
  static ownTables: {|
    AccountingTransactionInput: typeof Tables.AccountingTransactionInputSchema,
    AccountingTransactionOutput: typeof Tables.AccountingTransactionOutputSchema,
  |} = Object.freeze({
    [Tables.AccountingTransactionInputSchema.name]: Tables.AccountingTransactionInputSchema,
    [Tables.AccountingTransactionOutputSchema.name]: Tables.AccountingTransactionOutputSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async addIOsToTx(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      accountingInputs: Array<AccountingTransactionInputInsert>,
      accountingOutputs: Array<AccountingTransactionOutputInsert>,
    |},
  ): Promise<{| ...DbAccountingInputs, ...DbAccountingOutputs, |}> {
    const { accountingInputs, accountingOutputs } = request;
    const newInputs = await addBatchToTable<
      AccountingTransactionInputInsert,
      AccountingTransactionInputRow
    >(
      db, tx,
      accountingInputs,
      ModifyAccountingTransaction.ownTables[Tables.AccountingTransactionInputSchema.name].name
    );
    const newOutputs = await addBatchToTable<
      AccountingTransactionOutputInsert,
      AccountingTransactionOutputRow
    >(
      db, tx,
      accountingOutputs,
      ModifyAccountingTransaction.ownTables[Tables.AccountingTransactionOutputSchema.name].name
    );

    return {
      accountingInputs: newInputs,
      accountingOutputs: newOutputs,
    };
  }
}
