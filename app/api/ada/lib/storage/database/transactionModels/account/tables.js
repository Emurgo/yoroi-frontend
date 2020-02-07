// @flow

import { Type, ConstraintAction, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

import {
  TransactionSchema,
  AddressSchema,
} from '../../primitives/tables';

export type AccountingTransactionInputInsert = {|
  TransactionId: number,
  AddressId: number,
  SpendingCounter: number,
  IndexInOwnTx: number,
  Amount: string,
|};
export type AccountingTransactionInputRow = {|
  AccountingTransactionInputId: number,
  ...AccountingTransactionInputInsert,
|};
export const AccountingTransactionInputSchema: {|
  +name: 'AccountingTransactionInput',
  properties: $ObjMapi<AccountingTransactionInputRow, ToSchemaProp>,
|} = {
  name: 'AccountingTransactionInput',
  properties: {
    AccountingTransactionInputId: 'AccountingTransactionInputId',
    TransactionId: 'TransactionId',
    AddressId: 'AddressId',
    SpendingCounter: 'SpendingCounter',
    IndexInOwnTx: 'IndexInOwnTx',
    Amount: 'Amount',
  }
};

export type AccountingTransactionOutputInsert = {|
  TransactionId: number,
  AddressId: number,
  OutputIndex: number,
  Amount: string,
|};
export type AccountingTransactionOutputRow = {|
  AccountingTransactionOutputId: number,
  ...AccountingTransactionOutputInsert,
|};
/**
 * For outputs that belong to you,
 * Accounting outputs are a super-set of inputs because for an address to be an input,
 * it must have received coins (been an output) previously
 */
export const AccountingTransactionOutputSchema: {|
  +name: 'AccountingTransactionOutput',
  properties: $ObjMapi<AccountingTransactionOutputRow, ToSchemaProp>,
|} = {
  name: 'AccountingTransactionOutput',
  properties: {
    AccountingTransactionOutputId: 'AccountingTransactionOutputId',
    TransactionId: 'TransactionId',
    AddressId: 'AddressId',
    OutputIndex: 'OutputIndex',
    Amount: 'Amount',
  }
};

export type DbAccountingInputs = {|
  +accountingInputs: $ReadOnlyArray<$ReadOnly<AccountingTransactionInputRow>>;
|};
export type DbAccountingOutputs = {|
  +accountingOutputs: $ReadOnlyArray<$ReadOnly<AccountingTransactionOutputRow>>;
|};

export const populateAccountingTransactionsDb = (schemaBuilder: lf$schema$Builder) => {
  // AccountingTransactionInput Table
  schemaBuilder.createTable(AccountingTransactionInputSchema.name)
    .addColumn(
      AccountingTransactionInputSchema.properties.AccountingTransactionInputId,
      Type.INTEGER
    )
    .addColumn(AccountingTransactionInputSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(AccountingTransactionInputSchema.properties.AddressId, Type.INTEGER)
    .addColumn(AccountingTransactionInputSchema.properties.SpendingCounter, Type.INTEGER)
    .addColumn(AccountingTransactionInputSchema.properties.IndexInOwnTx, Type.INTEGER)
    .addColumn(AccountingTransactionInputSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([AccountingTransactionInputSchema.properties.AccountingTransactionInputId]: Array<string>),
      true
    )
    .addForeignKey('AccountingTransactionInput_Transaction', {
      local: AccountingTransactionInputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('AccountingTransactionInput_Address', {
      local: AccountingTransactionInputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`
    });

  // AccountingTransactionOutput Table
  schemaBuilder.createTable(AccountingTransactionOutputSchema.name)
    .addColumn(
      AccountingTransactionOutputSchema.properties.AccountingTransactionOutputId,
      Type.INTEGER
    )
    .addColumn(AccountingTransactionOutputSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(AccountingTransactionOutputSchema.properties.AddressId, Type.INTEGER)
    .addColumn(AccountingTransactionOutputSchema.properties.OutputIndex, Type.INTEGER)
    .addColumn(AccountingTransactionOutputSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([AccountingTransactionOutputSchema.properties.AccountingTransactionOutputId]: Array<string>),
      true
    )
    .addForeignKey('AccountingTransactionOutput_Transaction', {
      local: AccountingTransactionOutputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('AccountingTransactionOutput_Address', {
      local: AccountingTransactionOutputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`
    });
};
