// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export const WalletType = Object.freeze({
  Bip44: 'bip44',
});

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
  +name: 'Key',
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

export type AddressInsert = {|
  Digest: number,
  Hash: string,
|};
export type AddressRow = {|
  AddressId: number,
  ...AddressInsert,
|};
export const AddressSchema: {
  +name: 'Address',
  properties: $ObjMapi<AddressRow, ToSchemaProp>
} = {
  name: 'Address',
  properties: {
    AddressId: 'AddressId',
    Digest: 'Digest',
    Hash: 'Hash',
  }
};

export type EncryptionMetaInsert = {|
  EncryptionMetaId: number,
  /**
   * Need a seed for hashing
   * or you could easily make a rainbow table for the whole blockchain
   */
  AddressSeed: number,
  TransactionSeed: number,
  BlockSeed: number,
|};
export type EncryptionMetaRow = {|
  ...EncryptionMetaInsert,
|};
export const EncryptionMetaSchema: {
  +name: 'EncryptionMeta',
  properties: $ObjMapi<EncryptionMetaRow, ToSchemaProp>
} = {
  name: 'EncryptionMeta',
  properties: {
    EncryptionMetaId: 'EncryptionMetaId',
    AddressSeed: 'AddressSeed',
    TransactionSeed: 'TransactionSeed',
    BlockSeed: 'BlockSeed',
  }
};

export type KeyDerivationInsert = {|
  PublicKeyId: number | null,
  PrivateKeyId: number | null,
  Parent: number | null,
  Index: number | null,
|};
export type KeyDerivationRow = {|
  KeyDerivationId: number, // serial
  ...KeyDerivationInsert,
|};
export const KeyDerivationSchema: {
  +name: 'KeyDerivation',
  properties: $ObjMapi<KeyDerivationRow, ToSchemaProp>
} = {
  name: 'KeyDerivation',
  properties: {
    KeyDerivationId: 'KeyDerivationId',
    PrivateKeyId: 'PrivateKeyId',
    PublicKeyId: 'PublicKeyId',
    Parent: 'Parent',
    Index: 'Index',
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
  +name: 'ConceptualWallet',
  properties: $ObjMapi<ConceptualWalletRow, ToSchemaProp>
} = {
  name: 'ConceptualWallet',
  properties: {
    ConceptualWalletId: 'ConceptualWalletId',
    CoinType: 'CoinType',
    Name: 'Name',
  }
};

export type BlockInsert = {|
  SlotNum: number,
  /**
   * Height != SlotNum since height skips empty slots
   */
  Height: number,
  Digest: number,
  Hash: string,
  BlockTime: Date,
|};
export type BlockRow = {|
  BlockId: number,
  ...BlockInsert,
|};
export const BlockSchema: {
  +name: 'Block',
  properties: $ObjMapi<BlockRow, ToSchemaProp>
} = {
  name: 'Block',
  properties: {
    BlockId: 'BlockId',
    SlotNum: 'SlotNum',
    Height: 'Height',
    Digest: 'Digest',
    Hash: 'Hash',
    BlockTime: 'BlockTime',
  }
};

export type DbBlock = {|
  +block: $ReadOnly<BlockRow>;
|};

export const populateUncategorizedDb = (schemaBuilder: lf$schema$Builder) => {
  // ConceptualWallet Table
  schemaBuilder.createTable(ConceptualWalletSchema.name)
    .addColumn(ConceptualWalletSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.CoinType, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.Name, Type.STRING)
    .addPrimaryKey(
      ([ConceptualWalletSchema.properties.ConceptualWalletId]: Array<string>),
      true,
    );

  // Key Table
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

  // Address Table
  schemaBuilder.createTable(AddressSchema.name)
    .addColumn(AddressSchema.properties.AddressId, Type.INTEGER)
    .addColumn(AddressSchema.properties.Digest, Type.NUMBER)
    .addColumn(AddressSchema.properties.Hash, Type.STRING)
    .addPrimaryKey(
      ([AddressSchema.properties.AddressId]: Array<string>),
      true,
    )
    .addIndex(
      'Address_Digest_Index',
      ([AddressSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    );


  // EncryptionMeta Table
  schemaBuilder.createTable(EncryptionMetaSchema.name)
    .addColumn(EncryptionMetaSchema.properties.EncryptionMetaId, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.AddressSeed, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.TransactionSeed, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.BlockSeed, Type.INTEGER)
    .addPrimaryKey(
      ([EncryptionMetaSchema.properties.EncryptionMetaId]: Array<string>),
      false,
    );

  // KeyDerivation Table
  schemaBuilder.createTable(KeyDerivationSchema.name)
    .addColumn(KeyDerivationSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.PrivateKeyId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.PublicKeyId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.Parent, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.Index, Type.INTEGER)
    .addPrimaryKey(
      ([KeyDerivationSchema.properties.KeyDerivationId]: Array<string>),
      true
    )
    .addForeignKey('KeyDerivation_Parent', {
      local: KeyDerivationSchema.properties.Parent,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addForeignKey('KeyDerivation_PrivateKeyId', {
      local: KeyDerivationSchema.properties.PrivateKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`
    })
    .addForeignKey('KeyDerivation_PublicKeyId', {
      local: KeyDerivationSchema.properties.PublicKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`
    })
    .addNullable([
      KeyDerivationSchema.properties.PrivateKeyId,
      KeyDerivationSchema.properties.PublicKeyId,
      KeyDerivationSchema.properties.Parent,
      KeyDerivationSchema.properties.Index,
    ]);

  schemaBuilder.createTable(BlockSchema.name)
    .addColumn(BlockSchema.properties.BlockId, Type.INTEGER)
    .addColumn(BlockSchema.properties.SlotNum, Type.INTEGER)
    .addColumn(BlockSchema.properties.Height, Type.INTEGER)
    .addColumn(BlockSchema.properties.Digest, Type.NUMBER)
    .addColumn(BlockSchema.properties.Hash, Type.STRING)
    .addColumn(BlockSchema.properties.BlockTime, Type.DATE_TIME)
    .addPrimaryKey(
      ([BlockSchema.properties.BlockId]: Array<string>),
      true,
    )
    .addIndex(
      'Block_Digest_Index',
      ([BlockSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    );
};
