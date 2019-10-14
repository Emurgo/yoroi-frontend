// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

import {
  BlockSchema,
  AddressSchema,
} from '../primitives/tables';
import type { DbBlock, } from '../primitives/tables';

export const TxStatusCodes = Object.freeze({
  NOT_IN_REMOTE: -3,
  ROLLBACK_FAIL: -2,
  FAIL_RESPONSE: -1,
  PENDING: 0,
  IN_BLOCK: 1,
});
export type TxStatusCodesType = $Values<typeof TxStatusCodes>

export type TransactionInsert = {|
  Digest: number,
  Hash: string,
  BlockId: null | number,
  Ordinal: null | number,
  /**
   * Need this otherwise we wouldn't be able to sort transactions by time
   * Can't only use slot+epoch as these aren't available for pending/failed txs
   */
  LastUpdateTime: number,
  Status: TxStatusCodesType,
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
    Digest: 'Digest',
    Hash: 'Hash',
    BlockId: 'BlockId',
    Ordinal: 'Ordinal',
    LastUpdateTime: 'LastUpdateTime',
    Status: 'Status',
    ErrorMessage: 'ErrorMessage',
  }
};

export type UtxoTransactionInputInsert = {|
  /**
   * The TX where this input occurred
   * NOT the tx that generated the UTXO
   */
  TransactionId: number,
  AddressId: number,
  IndexInParentTx: number,
  ParentTxHash: string,
  IndexInOwnTx: number,
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
    AddressId: 'AddressId',
    ParentTxHash: 'ParentTxHash',
    IndexInParentTx: 'IndexInParentTx',
    IndexInOwnTx: 'IndexInOwnTx',
    Amount: 'Amount',
  }
};

export type UtxoTransactionOutputInsert = {|
  TransactionId: number,
  AddressId: number,
  OutputIndex: number,
  Amount: string,
  IsUnspent: boolean,
|};
export type UtxoTransactionOutputRow = {|
  UtxoTransactionOutputId: number,
  ...UtxoTransactionOutputInsert,
|};
/**
 * For outputs that belong to you,
 * utxo outputs are a super-set of inputs because for an address to be an input,
 * it must have received coins (been an output) previously
 */
export const UtxoTransactionOutputSchema: {
  +name: 'UtxoTransactionOutput',
  properties: $ObjMapi<UtxoTransactionOutputRow, ToSchemaProp>
} = {
  name: 'UtxoTransactionOutput',
  properties: {
    UtxoTransactionOutputId: 'UtxoTransactionOutputId',
    TransactionId: 'TransactionId',
    AddressId: 'AddressId',
    OutputIndex: 'OutputIndex',
    Amount: 'Amount',
    IsUnspent: 'IsUnspent',
  }
};

export type DbTransaction = {|
  +transaction: $ReadOnly<TransactionRow>,
|};
export type DbUtxoInputs = {|
  +utxoInputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>;
|};
export type DbUtxoOutputs = {|
  +utxoOutputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>;
|};
export type DbTxIO = {| ...DbTransaction, ...DbUtxoInputs, ...DbUtxoOutputs |};
export type DbTxInChain = {| ...DbTxIO, ...DbBlock |};


export const populateTransactionsDb = (schemaBuilder: lf$schema$Builder) => {
  // Transaction table
  schemaBuilder.createTable(TransactionSchema.name)
    .addColumn(TransactionSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Digest, Type.NUMBER)
    .addColumn(TransactionSchema.properties.Hash, Type.STRING)
    .addColumn(TransactionSchema.properties.BlockId, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Ordinal, Type.INTEGER)
    .addColumn(TransactionSchema.properties.LastUpdateTime, Type.NUMBER)
    .addColumn(TransactionSchema.properties.Status, Type.INTEGER)
    .addColumn(TransactionSchema.properties.ErrorMessage, Type.STRING)
    .addPrimaryKey(
      ([TransactionSchema.properties.TransactionId]: Array<string>),
      true,
    )
    .addForeignKey('Transaction_Block', {
      local: TransactionSchema.properties.BlockId,
      ref: `${BlockSchema.name}.${BlockSchema.properties.BlockId}`
    })
    .addNullable([
      TransactionSchema.properties.BlockId,
      TransactionSchema.properties.Ordinal,
      TransactionSchema.properties.ErrorMessage,
    ])
    .addIndex(
      'Transaction_Digest_Index',
      ([TransactionSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    );

  // UtxoTransactionInput Table
  schemaBuilder.createTable(UtxoTransactionInputSchema.name)
    .addColumn(UtxoTransactionInputSchema.properties.UtxoTransactionInputId, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.AddressId, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.ParentTxHash, Type.STRING)
    .addColumn(UtxoTransactionInputSchema.properties.IndexInParentTx, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.IndexInOwnTx, Type.INTEGER)
    .addColumn(UtxoTransactionInputSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([UtxoTransactionInputSchema.properties.UtxoTransactionInputId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionInput_Transaction', {
      local: UtxoTransactionInputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`
    })
    .addForeignKey('UtxoTransactionInput_Address', {
      local: UtxoTransactionInputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`
    });

  // UtxoTransactionOutput Table
  schemaBuilder.createTable(UtxoTransactionOutputSchema.name)
    .addColumn(UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.AddressId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.OutputIndex, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.Amount, Type.STRING)
    .addColumn(UtxoTransactionOutputSchema.properties.IsUnspent, Type.BOOLEAN)
    .addPrimaryKey(
      ([UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionOutput_Transaction', {
      local: UtxoTransactionOutputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`
    })
    .addForeignKey('UtxoTransactionOutput_Address', {
      local: UtxoTransactionOutputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`
    });
};
