// @flow

import { Type, ConstraintAction, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { KeyDerivationSchema } from '../../primitives/tables';

export type ConceptualWalletInsert = {|
  Name: string,
  NetworkId: number,
|};
export type ConceptualWalletRow = {|
  ConceptualWalletId: number,
  ...ConceptualWalletInsert,
|};
export const ConceptualWalletSchema: {|
  +name: 'ConceptualWallet',
  properties: $ObjMapi<ConceptualWalletRow, ToSchemaProp>,
|} = {
  name: 'ConceptualWallet',
  properties: {
    ConceptualWalletId: 'ConceptualWalletId',
    Name: 'Name',
    NetworkId: 'NetworkId',
  }
};

export type PublicDeriverInsert = {|
  // we hook into ConceptualWallet instead of the wrapper
  // since there are many wrapper types
  ConceptualWalletId: number,
  KeyDerivationId: number,
  Name: string,
  Index: number, // a user may want to re-order the public deriver in the UI
  LastSyncInfoId: number,
|};
export type PublicDeriverRow = {|
  PublicDeriverId: number, // serial
  ...PublicDeriverInsert,
|};
export const PublicDeriverSchema: {|
  +name: 'PublicDeriver',
  properties: $ObjMapi<PublicDeriverRow, ToSchemaProp>,
|} = {
  name: 'PublicDeriver',
  properties: {
    PublicDeriverId: 'PublicDeriverId',
    ConceptualWalletId: 'ConceptualWalletId',
    KeyDerivationId: 'KeyDerivationId',
    Name: 'Name',
    Index: 'Index',
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
export const LastSyncInfoSchema: {|
  +name: 'LastSyncInfo',
  properties: $ObjMapi<LastSyncInfoRow, ToSchemaProp>,
|} = {
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
  DeviceId: string,
|};
export type HwWalletMetaInsert = {|
  ConceptualWalletId: number,
  ...HWFeatures,
|};
export type HwWalletMetaRow = {|
  ...HwWalletMetaInsert,
|};
export const HwWalletMetaSchema: {|
  +name: 'HwWalletMeta',
  properties: $ObjMapi<HwWalletMetaRow, ToSchemaProp>,
|} = {
  name: 'HwWalletMeta',
  properties: {
    ConceptualWalletId: 'ConceptualWalletId',
    Vendor: 'Vendor',
    Model: 'Model',
    DeviceId: 'DeviceId',
  }
};

export const populateWalletDb = (schemaBuilder: lf$schema$Builder) => {
  // ConceptualWallet Table
  schemaBuilder.createTable(ConceptualWalletSchema.name)
    .addColumn(ConceptualWalletSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.NetworkId, Type.INTEGER)
    .addColumn(ConceptualWalletSchema.properties.Name, Type.STRING)
    .addPrimaryKey(
      ([ConceptualWalletSchema.properties.ConceptualWalletId]: Array<string>),
      true,
    );

  // PublicDeriver
  schemaBuilder.createTable(PublicDeriverSchema.name)
    .addColumn(PublicDeriverSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.Name, Type.STRING)
    .addColumn(PublicDeriverSchema.properties.Index, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.LastSyncInfoId, Type.INTEGER)
    .addPrimaryKey(
      ([PublicDeriverSchema.properties.PublicDeriverId]: Array<string>),
      true
    )
    .addForeignKey('PublicDeriver_ConceptualWallet', {
      local: PublicDeriverSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addForeignKey('PublicDeriver_KeyDerivation', {
      local: PublicDeriverSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('PublicDeriver_LastSyncInfo', {
      local: PublicDeriverSchema.properties.LastSyncInfoId,
      ref: `${LastSyncInfoSchema.name}.${LastSyncInfoSchema.properties.LastSyncInfoId}`
    })
    .addIndex(
      'Bip44ToPublicDeriver_ConceptualWallet_Index',
      ([PublicDeriverSchema.properties.ConceptualWalletId]: Array<string>),
      false
    );

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
    .addColumn(HwWalletMetaSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(HwWalletMetaSchema.properties.Vendor, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.Model, Type.STRING)
    .addColumn(HwWalletMetaSchema.properties.DeviceId, Type.STRING)
    .addForeignKey('HwWalletMetaSchema_ConceptualWallet', {
      local: HwWalletMetaSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`,
      action: ConstraintAction.CASCADE,
    })
    .addUnique('HwWalletMetaSchema_ConceptualWallet_Unique', [
      HwWalletMetaSchema.properties.ConceptualWalletId,
    ]);
};
