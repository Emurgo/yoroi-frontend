// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { KeyDerivationSchema } from '../primitives/tables';

// TODO: get rid of this import
import { Bip44WrapperSchema }  from '../bip44/tables';

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

export type PublicDeriverInsert = {|
  Bip44WrapperId: number,
  KeyDerivationId: number,
  Name: string,
  LastSyncInfoId: number,
|};
export type PublicDeriverRow = {|
  PublicDeriverId: number, // serial
  ...PublicDeriverInsert,
|};
export const PublicDeriverSchema: {
  +name: 'PublicDeriver',
  properties: $ObjMapi<PublicDeriverRow, ToSchemaProp>
} = {
  name: 'PublicDeriver',
  properties: {
    PublicDeriverId: 'PublicDeriverId',
    Bip44WrapperId: 'Bip44WrapperId',
    KeyDerivationId: 'KeyDerivationId',
    Name: 'Name',
    LastSyncInfoId: 'LastSyncInfoId',
  }
};

export type LastSyncInfoInsert = {|
  /**
   * Time here advances even on rollbacks
   * also recall: for currencies other than Ada, you can't infer time from just block number
   */
  Time: null | Date,
  /**
   * Need SlotNum otherwise if this block isn't stored locally, we wouldn't know how many
   * blocks need to be rolled back if a rollback happens
   */
  SlotNum: null | number,
  BlockHash: null | string,
  Height: number,
|};
export type LastSyncInfoRow = {|
  LastSyncInfoId: number,
  ...LastSyncInfoInsert,
|};
export const LastSyncInfoSchema: {
  +name: 'LastSyncInfo',
  properties: $ObjMapi<LastSyncInfoRow, ToSchemaProp>
} = {
  name: 'LastSyncInfo',
  properties: {
    LastSyncInfoId: 'LastSyncInfoId',
    Time: 'Time',
    SlotNum: 'SlotNum',
    BlockHash: 'BlockHash',
    Height: 'Height',
  }
};

export type HWFeatures = {|
  Vendor: string,
  Model: string,
  Label: string,
  DeviceId: string,
  Language: string,
  MajorVersion: number,
  MinorVersion: number,
  PatchVersion: number,
|};
export type HwWalletMetaInsert = {|
  ConceptualWalletId: number,
  ...HWFeatures,
|};
export type HwWalletMetaRow = {|
  HwWalletMetaId: number,
  ...HwWalletMetaInsert,
|};
export const HwWalletMetaSchema: {
  +name: 'HwWalletMeta',
  properties: $ObjMapi<HwWalletMetaRow, ToSchemaProp>
} = {
  name: 'HwWalletMeta',
  properties: {
    HwWalletMetaId: 'HwWalletMetaId',
    ConceptualWalletId: 'ConceptualWalletId',
    Vendor: 'Vendor',
    Model: 'Model',
    Label: 'Label',
    DeviceId: 'DeviceId',
    Language: 'Language',
    MajorVersion: 'MajorVersion',
    MinorVersion: 'MinorVersion',
    PatchVersion: 'PatchVersion',
  }
};

export const populateWalletDb = (schemaBuilder: lf$schema$Builder) => {
  // ConceptualWallet Table
  schemaBuilder.createTable(ConceptualWalletSchema.name)
    .addColumn(ConceptualWalletSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.CoinType, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.Name, Type.STRING)
    .addPrimaryKey(
      ([ConceptualWalletSchema.properties.ConceptualWalletId]: Array<string>),
      true,
    );

  // PublicDeriver
  schemaBuilder.createTable(PublicDeriverSchema.name)
    .addColumn(PublicDeriverSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.Name, Type.STRING)
    .addColumn(PublicDeriverSchema.properties.LastSyncInfoId, Type.INTEGER)
    .addPrimaryKey(
      ([PublicDeriverSchema.properties.PublicDeriverId]: Array<string>),
      true
    )
    .addForeignKey('PublicDeriver_Bip44Derivation', {
      local: PublicDeriverSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addForeignKey('PublicDeriver_Bip44Wrapper', {
      local: PublicDeriverSchema.properties.Bip44WrapperId,
      ref: `${Bip44WrapperSchema.name}.${Bip44WrapperSchema.properties.Bip44WrapperId}`
    })
    .addForeignKey('PublicDeriver_LastSyncInfo', {
      local: PublicDeriverSchema.properties.LastSyncInfoId,
      ref: `${LastSyncInfoSchema.name}.${LastSyncInfoSchema.properties.LastSyncInfoId}`
    });

  // LastSyncInfoSchema Table
  schemaBuilder.createTable(LastSyncInfoSchema.name)
    .addColumn(LastSyncInfoSchema.properties.LastSyncInfoId, Type.INTEGER)
    .addColumn(LastSyncInfoSchema.properties.Time, Type.DATE_TIME)
    .addColumn(LastSyncInfoSchema.properties.SlotNum, Type.NUMBER)
    .addColumn(LastSyncInfoSchema.properties.BlockHash, Type.STRING)
    .addColumn(LastSyncInfoSchema.properties.Height, Type.NUMBER)
    .addPrimaryKey(
      ([LastSyncInfoSchema.properties.LastSyncInfoId]: Array<string>),
      true,
    )
    .addNullable([
      LastSyncInfoSchema.properties.Time,
      LastSyncInfoSchema.properties.SlotNum,
      LastSyncInfoSchema.properties.BlockHash,
    ]);

  // HwWalletMeta Table
  schemaBuilder.createTable(HwWalletMetaSchema.name)
    .addColumn(HwWalletMetaSchema.properties.HwWalletMetaId, Type.INTEGER)
    .addColumn(HwWalletMetaSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(HwWalletMetaSchema.properties.Vendor, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.Model, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.Label, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.DeviceId, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.Language, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.MajorVersion, Type.INTEGER)
    .addColumn(HwWalletMetaSchema.properties.MinorVersion, Type.INTEGER)
    .addColumn(HwWalletMetaSchema.properties.PatchVersion, Type.INTEGER)
    .addPrimaryKey(
      ([HwWalletMetaSchema.properties.HwWalletMetaId]: Array<string>),
      true,
    )
    .addForeignKey('HwWalletMetaSchema_ConceptualWallet', {
      local: HwWalletMetaSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addUnique('HwWalletMetaSchema_ConceptualWallet_Unique', [
      HwWalletMetaSchema.properties.ConceptualWalletId,
    ]);
};
