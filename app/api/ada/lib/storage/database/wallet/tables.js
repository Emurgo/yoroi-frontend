// @flow

import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import {
  ConceptualWalletSchema,
} from '../uncategorized/tables';

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
