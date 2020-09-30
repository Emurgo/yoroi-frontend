// @flow

import { Type, ConstraintAction } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

import {
  TransactionSchema,
  AddressSchema,
  TokenSchema,
} from '../../primitives/tables';

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
export const UtxoTransactionInputSchema: {|
  +name: 'UtxoTransactionInput',
  properties: $ObjMapi<UtxoTransactionInputRow, ToSchemaProp>,
|} = {
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

type ErgoFields = {|
  ErgoBoxId: string,
  ErgoCreationHeight: number,
  ErgoTree: string,
|};
export type UtxoTransactionOutputInsert = {|
  TransactionId: number,
  AddressId: number,
  OutputIndex: number,
  Amount: string,
  IsUnspent: boolean,
  ...WithNullableFields<ErgoFields>,
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
export const UtxoTransactionOutputSchema: {|
  +name: 'UtxoTransactionOutput',
  properties: $ObjMapi<UtxoTransactionOutputRow, ToSchemaProp>,
|} = {
  name: 'UtxoTransactionOutput',
  properties: {
    UtxoTransactionOutputId: 'UtxoTransactionOutputId',
    TransactionId: 'TransactionId',
    AddressId: 'AddressId',
    OutputIndex: 'OutputIndex',
    Amount: 'Amount',
    IsUnspent: 'IsUnspent',
    ErgoBoxId: 'ErgoBoxId',
    ErgoCreationHeight: 'ErgoCreationHeight',
    ErgoTree: 'ErgoTree',
  }
};

export type TokenListInsert = {|
  TokenId: number,
  UtxoTransactionOutputId: null | number,
  UtxoTransactionInputId: null | number,
  Index: number,
  Amount: string,
|};
export type TokenListRow = {|
  TokenListItemId: number,
  ...TokenListInsert,
|};
/**
 * For outputs that belong to you,
 * utxo outputs are a super-set of inputs because for an address to be an input,
 * it must have received coins (been an output) previously
 */
export const TokenListSchema: {|
  +name: 'TokenList',
  properties: $ObjMapi<TokenListRow, ToSchemaProp>,
|} = {
  name: 'TokenList',
  properties: {
    TokenListItemId: 'TokenListItemId',
    TokenId: 'TokenId',
    UtxoTransactionOutputId: 'UtxoTransactionOutputId',
    UtxoTransactionInputId: 'UtxoTransactionInputId',
    Index: 'Index',
    Amount: 'Amount',
  }
};

export type DbUtxoInputs = {|
  +utxoInputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>;
|};
export type DbUtxoOutputs = {|
  +utxoOutputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>;
|};
export type DbUtxoTokenInputs = {|
  +utxoTokenInputs: $ReadOnlyArray<$ReadOnly<TokenListRow>>;
|};
export type DbUtxoTokenOutputs = {|
  +utxoTokenOutputs: $ReadOnlyArray<$ReadOnly<TokenListRow>>;
|};

export const populateUtxoTransactionsDb = (schemaBuilder: lf$schema$Builder) => {
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
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('UtxoTransactionInput_Address', {
      local: UtxoTransactionInputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`,
    });

  // UtxoTransactionOutput Table
  schemaBuilder.createTable(UtxoTransactionOutputSchema.name)
    .addColumn(UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.AddressId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.OutputIndex, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.Amount, Type.STRING)
    .addColumn(UtxoTransactionOutputSchema.properties.IsUnspent, Type.BOOLEAN)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoBoxId, Type.STRING)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoCreationHeight, Type.NUMBER)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoTree, Type.STRING)
    .addPrimaryKey(
      ([UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionOutput_Transaction', {
      local: UtxoTransactionOutputSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('UtxoTransactionOutput_Address', {
      local: UtxoTransactionOutputSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`,
    })
    .addNullable([
      UtxoTransactionOutputSchema.properties.ErgoBoxId,
      UtxoTransactionOutputSchema.properties.ErgoCreationHeight,
      UtxoTransactionOutputSchema.properties.ErgoTree,
    ]);

  // UtxoTransactionOutput Table
  schemaBuilder.createTable(TokenListSchema.name)
    .addColumn(TokenListSchema.properties.TokenListItemId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.TokenId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.UtxoTransactionOutputId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.UtxoTransactionInputId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.Index, Type.INTEGER)
    .addColumn(TokenListSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(
      ([TokenListSchema.properties.TokenListItemId]: Array<string>),
      true
    )
    .addForeignKey('UtxoTransactionOutputAsset_UtxoTransactionOutput', {
      local: TokenListSchema.properties.UtxoTransactionOutputId,
      ref: `${UtxoTransactionOutputSchema.name}.${UtxoTransactionOutputSchema.properties.UtxoTransactionOutputId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('UtxoTransactionOutputAsset_UtxoTransactionInput', {
      local: TokenListSchema.properties.UtxoTransactionInputId,
      ref: `${UtxoTransactionInputSchema.name}.${UtxoTransactionInputSchema.properties.UtxoTransactionInputId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('TokenList_Token', {
      local: TokenListSchema.properties.TokenId,
      ref: `${TokenSchema.name}.${TokenSchema.properties.TokenId}`,
    })
    .addNullable([
      TokenListSchema.properties.UtxoTransactionInputId,
      TokenListSchema.properties.UtxoTransactionOutputId,
    ]);
};
