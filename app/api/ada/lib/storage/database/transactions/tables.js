// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

import {
  Bip44AddressSchema,
} from '../genericBip44/tables';

export type TransactionInsert = {|
  Hash: string,
  BlockNumber: number,
  IsPending: boolean,
  ErrorCode: number | null,
  ErrorMessage: string | null,
|};
export type TransactionRow = {|
  TransactionId: number,
  ...TransactionInsert,
|};
export const TransactionSchema: {
  +name: 'Transaction',
  properties: $ObjMapi<TransactionRow, ToSchemaProp>
} = {
  name: 'Transaction',
  properties: {
    TransactionId: 'TransactionId',
    Hash: 'Hash',
    BlockNumber: 'BlockNumber',
    IsPending: 'IsPending',
    ErrorCode: 'ErrorCode',
    ErrorMessage: 'ErrorMessage',
  }
};

export type UtxoTransactionInputInsert = {|
  TransactionId: number,
  Bip44AddressId: number,
  InputIndex: number,
  Amount: string,
|};
export type UtxoTransactionInputRow = {|
  UtxoTransactionInputId: number,
  ...UtxoTransactionInputInsert,
|};
export const UtxoTransactionInputSchema: {
  +name: 'UtxoTransactionInput',
  properties: $ObjMapi<UtxoTransactionInputRow, ToSchemaProp>
} = {
  name: 'UtxoTransactionInput',
  properties: {
    UtxoTransactionInputId: 'UtxoTransactionInputId',
    TransactionId: 'TransactionId',
    Bip44AddressId: 'Bip44AddressId',
    InputIndex: 'InputIndex',
    Amount: 'Amount',
  }
};

export type UtxoTransactionOutputInsert = {|
  TransactionId: number,
  Bip44AddressId: number,
  OutputIndex: number,
  Amount: string,
  IsUnspent: boolean,
|};
export type UtxoTransactionOutputRow = {|
  UtxoTransactionOutputId: number,
  ...UtxoTransactionOutputInsert,
|};
export const UtxoTransactionOutputSchema: {
  +name: 'UtxoTransactionOutput',
  properties: $ObjMapi<UtxoTransactionOutputRow, ToSchemaProp>
} = {
  name: 'UtxoTransactionOutput',
  properties: {
    UtxoTransactionOutputId: 'UtxoTransactionOutputId',
    TransactionId: 'TransactionId',
    Bip44AddressId: 'Bip44AddressId',
    OutputIndex: 'OutputIndex',
    Amount: 'Amount',
    IsUnspent: 'IsUnspent',
  }
};

export const populateTransactionsDb = (schemaBuilder: lf$schema$Builder) => {
  // Transaction table
  schemaBuilder.createTable(TransactionSchema.name)
    .addColumn(TransactionSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Hash, Type.STRING)
    .addColumn(TransactionSchema.properties.BlockNumber, Type.INTEGER)
    .addColumn(TransactionSchema.properties.IsPending, Type.BOOLEAN)
    .addColumn(TransactionSchema.properties.ErrorCode, Type.INTEGER)
    .addColumn(TransactionSchema.properties.ErrorMessage, Type.STRING)
    .addPrimaryKey(
      ([TransactionSchema.properties.TransactionId]: Array<string>),
      true,
    )
    .addNullable([
      TransactionSchema.properties.ErrorCode,
      TransactionSchema.properties.ErrorMessage,
    ]);

  // UtxoTransactionInput Table
  schemaBuilder.createTable(UtxoTransactionInputSchema.name)
    .addColumn(UtxoTransactionInputSchema.properties.UtxoTransactionInputId, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.InputIndex, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([UtxoTransactionInputSchema.properties.UtxoTransactionInputId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionInput_Transaction', {
      local: UtxoTransactionInputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`
    })
    .addForeignKey('UtxoTransactionInput_Bip44Address', {
      local: UtxoTransactionInputSchema.properties.Bip44AddressId,
      ref: `${Bip44AddressSchema.name}.${Bip44AddressSchema.properties.KeyDerivationId}`
    });

  // UtxoTransactionOutput Table
  schemaBuilder.createTable(UtxoTransactionOutputSchema.name)
    .addColumn(UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.OutputIndex, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionOutput_Transaction', {
      local: UtxoTransactionOutputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`
    })
    .addForeignKey('UtxoTransactionOutput_Bip44Address', {
      local: UtxoTransactionOutputSchema.properties.Bip44AddressId,
      ref: `${Bip44AddressSchema.name}.${Bip44AddressSchema.properties.KeyDerivationId}`
    });
};
