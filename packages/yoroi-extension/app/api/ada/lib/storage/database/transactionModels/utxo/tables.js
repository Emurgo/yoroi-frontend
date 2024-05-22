// @flow

import { Type, ConstraintAction } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

import {
  TransactionSchema,
  AddressSchema,
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
  TokenListId: number,
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
    TokenListId: 'TokenListId',
  }
};

export type ErgoFields = {|
  ErgoBoxId: string,
  ErgoCreationHeight: number,
  ErgoTree: string,
  ErgoRegisters: string, // JSON.stringify({| [key: string]: string /* hex */ |}),
|};
export type UtxoTransactionOutputInsert = {|
  TransactionId: number,
  AddressId: number,
  OutputIndex: number,
  TokenListId: number,
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
    TokenListId: 'TokenListId',
    IsUnspent: 'IsUnspent',
    // <TODO:PENDING_REMOVAL> Ergo
    ErgoBoxId: 'ErgoBoxId',
    ErgoCreationHeight: 'ErgoCreationHeight',
    ErgoTree: 'ErgoTree',
    ErgoRegisters: 'ErgoRegisters',
  }
};

export type DbUtxoInputs = {|
  +utxoInputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionInputRow>>;
|};
export type DbUtxoOutputs = {|
  +utxoOutputs: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>;
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
    .addColumn(UtxoTransactionOutputSchema.properties.TokenListId, Type.INTEGER)
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
    .addColumn(UtxoTransactionOutputSchema.properties.TokenListId, Type.INTEGER)
    .addColumn(UtxoTransactionOutputSchema.properties.IsUnspent, Type.BOOLEAN)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoBoxId, Type.STRING)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoCreationHeight, Type.NUMBER)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoTree, Type.STRING)
    .addColumn(UtxoTransactionOutputSchema.properties.ErgoRegisters, Type.STRING)
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
      UtxoTransactionOutputSchema.properties.ErgoRegisters,
    ]);
};
