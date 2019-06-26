// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';


export type KeyInsert = {|
  Hash: string,
  IsEncrypted: boolean,
  PasswordLastUpdate: Date | null,
|};
export type KeyRow = {|
  KeyId: number,
  ...KeyInsert,
|};
export const KeySchema: {
  name: string,
  properties: $ObjMapi<KeyRow, ToSchemaProp>
} = {
  name: 'Key',
  properties: {
    KeyId: 'KeyId',
    Hash: 'Hash',
    IsEncrypted: 'IsEncrypted',
    PasswordLastUpdate: 'PasswordLastUpdate',
  }
};

export type ConceptualWalletInsert = {|
  CoinType: number,
  Name: string,
  // NetworkId: number, // TODO
|};
export type ConceptualWalletRow = {|
  ConceptualWalletId: number,
  ...ConceptualWalletInsert,
|};
export const ConceptualWalletSchema: {
  name: string,
  properties: $ObjMapi<ConceptualWalletRow, ToSchemaProp>
} = {
  name: 'ConceptualWallet',
  properties: {
    ConceptualWalletId: 'ConceptualWalletId',
    CoinType: 'CoinType',
    Name: 'Name',
  }
};

export const populateUncategorizedDb = (schemaBuilder: lf$schema$Builder) => {
  schemaBuilder.createTable(ConceptualWalletSchema.name)
    .addColumn(ConceptualWalletSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.CoinType, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.Name, Type.STRING)
    .addPrimaryKey(
      ([ConceptualWalletSchema.properties.ConceptualWalletId]: Array<string>),
      true,
    );

  schemaBuilder.createTable(KeySchema.name)
    .addColumn(KeySchema.properties.KeyId, Type.INTEGER)
    .addColumn(KeySchema.properties.Hash, Type.STRING)
    .addColumn(KeySchema.properties.IsEncrypted, Type.BOOLEAN)
    .addColumn(KeySchema.properties.PasswordLastUpdate, Type.DATE_TIME)
    .addPrimaryKey(
      ([KeySchema.properties.KeyId]: Array<string>),
      true,
    )
    .addNullable(([
      KeySchema.properties.PasswordLastUpdate,
    ]));
};
