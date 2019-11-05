// @flow

import {
  ConceptualWalletSchema, PublicDeriverSchema,
} from '../core/tables';
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { KeyDerivationSchema } from '../../primitives/tables';

export type Bip44WrapperInsert = {|
  ConceptualWalletId: number,
  SignerLevel: number | null,
  PublicDeriverLevel: number,
  PrivateDeriverLevel: number | null,
  PrivateDeriverKeyDerivationId: number | null,
|};
export type Bip44WrapperRow = {|
  Bip44WrapperId: number, // serial
  ...Bip44WrapperInsert,
|};
export const Bip44WrapperSchema: {
  +name: 'Bip44Wrapper',
  properties: $ObjMapi<Bip44WrapperRow, ToSchemaProp>
} = {
  name: 'Bip44Wrapper',
  properties: {
    Bip44WrapperId: 'Bip44WrapperId',
    ConceptualWalletId: 'ConceptualWalletId',
    SignerLevel: 'SignerLevel',
    PublicDeriverLevel: 'PublicDeriverLevel',
    PrivateDeriverLevel: 'PrivateDeriverLevel',
    PrivateDeriverKeyDerivationId: 'PrivateDeriverKeyDerivationId',
  }
};

// TODO: this should be a generic table with an index "type" row
export type Bip44ToPublicDeriverInsert = {|
  Bip44WrapperId: number,
  PublicDeriverId: number,
  Index: number,
|};
export type Bip44ToPublicDeriverRow = {|
  Bip44ToPublicDeriverId: number,
  ...Bip44ToPublicDeriverInsert,
|};
export const Bip44ToPublicDeriverSchema: {
  +name: 'Bip44ToPublicDeriver',
  properties: $ObjMapi<Bip44ToPublicDeriverRow, ToSchemaProp>
} = {
  name: 'Bip44ToPublicDeriver',
  properties: {
    Bip44ToPublicDeriverId: 'Bip44ToPublicDeriverId',
    Bip44WrapperId: 'Bip44WrapperId',
    PublicDeriverId: 'PublicDeriverId',
    Index: 'Index',
  }
};

export const populateBip44Db = (schemaBuilder: lf$schema$Builder) => {
  // Bip44Wrapper Table
  schemaBuilder.createTable(Bip44WrapperSchema.name)
    .addColumn(Bip44WrapperSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.SignerLevel, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.PublicDeriverLevel, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.PrivateDeriverLevel, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.PrivateDeriverKeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44WrapperSchema.properties.Bip44WrapperId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Wrapper_ConceptualWallet', {
      local: Bip44WrapperSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addForeignKey('Bip44Wrapper_KeyDerivation', {
      local: Bip44WrapperSchema.properties.PrivateDeriverKeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addNullable([
      Bip44WrapperSchema.properties.SignerLevel,
      Bip44WrapperSchema.properties.PrivateDeriverLevel,
      Bip44WrapperSchema.properties.PrivateDeriverKeyDerivationId,
    ]);
  // Bip44ToPublicDeriver Tables
  schemaBuilder.createTable(Bip44ToPublicDeriverSchema.name)
    .addColumn(Bip44ToPublicDeriverSchema.properties.Bip44ToPublicDeriverId, Type.INTEGER)
    .addColumn(Bip44ToPublicDeriverSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(Bip44ToPublicDeriverSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(Bip44ToPublicDeriverSchema.properties.Index, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44ToPublicDeriverSchema.properties.Bip44ToPublicDeriverId]: Array<string>),
      true
    )
    .addForeignKey('Bip44ToPublicDeriver_PublicDeriver', {
      local: Bip44ToPublicDeriverSchema.properties.PublicDeriverId,
      ref: `${PublicDeriverSchema.name}.${PublicDeriverSchema.properties.PublicDeriverId}`
    })
    .addForeignKey('Bip44ToPublicDeriver_Bip44Wrapper', {
      local: Bip44ToPublicDeriverSchema.properties.Bip44WrapperId,
      ref: `${Bip44WrapperSchema.name}.${Bip44WrapperSchema.properties.Bip44WrapperId}`
    })
    .addIndex(
      'Bip44ToPublicDeriver_Bip44Wrapper_Index',
      ([Bip44ToPublicDeriverSchema.properties.Bip44WrapperId]: Array<string>),
      false
    );
};
