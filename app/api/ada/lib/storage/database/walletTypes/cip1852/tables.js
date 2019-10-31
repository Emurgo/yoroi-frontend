// @flow

import {
  ConceptualWalletSchema, PublicDeriverSchema,
} from '../core/tables';
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { KeyDerivationSchema } from '../../primitives/tables';

export type Cip1852WrapperInsert = {|
  ConceptualWalletId: number,
  SignerLevel: number | null,
  PublicDeriverLevel: number,
  PrivateDeriverLevel: number | null,
  PrivateDeriverKeyDerivationId: number | null,
|};
export type Cip1852WrapperRow = {|
  Cip1852WrapperId: number, // serial
  ...Cip1852WrapperInsert,
|};
export const Cip1852WrapperSchema: {
  +name: 'Cip1852Wrapper',
  properties: $ObjMapi<Cip1852WrapperRow, ToSchemaProp>
} = {
  name: 'Cip1852Wrapper',
  properties: {
    Cip1852WrapperId: 'Cip1852WrapperId',
    ConceptualWalletId: 'ConceptualWalletId',
    SignerLevel: 'SignerLevel',
    PublicDeriverLevel: 'PublicDeriverLevel',
    PrivateDeriverLevel: 'PrivateDeriverLevel',
    PrivateDeriverKeyDerivationId: 'PrivateDeriverKeyDerivationId',
  }
};

export type Cip1852ToPublicDeriverInsert = {|
  Cip1852WrapperId: number,
  PublicDeriverId: number,
  Index: number,
|};
export type Cip1852ToPublicDeriverRow = {|
  Cip1852ToPublicDeriverId: number,
  ...Cip1852ToPublicDeriverInsert,
|};
export const Cip1852ToPublicDeriverSchema: {
  +name: 'Cip1852ToPublicDeriver',
  properties: $ObjMapi<Cip1852ToPublicDeriverRow, ToSchemaProp>
} = {
  name: 'Cip1852ToPublicDeriver',
  properties: {
    Cip1852ToPublicDeriverId: 'Cip1852ToPublicDeriverId',
    Cip1852WrapperId: 'Cip1852WrapperId',
    PublicDeriverId: 'PublicDeriverId',
    Index: 'Index',
  }
};

export const populateCip1852Db = (schemaBuilder: lf$schema$Builder) => {
  // Cip1852Wrapper Table
  schemaBuilder.createTable(Cip1852WrapperSchema.name)
    .addColumn(Cip1852WrapperSchema.properties.Cip1852WrapperId, Type.INTEGER)
    .addColumn(Cip1852WrapperSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(Cip1852WrapperSchema.properties.SignerLevel, Type.INTEGER)
    .addColumn(Cip1852WrapperSchema.properties.PublicDeriverLevel, Type.INTEGER)
    .addColumn(Cip1852WrapperSchema.properties.PrivateDeriverLevel, Type.INTEGER)
    .addColumn(Cip1852WrapperSchema.properties.PrivateDeriverKeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Cip1852WrapperSchema.properties.Cip1852WrapperId]: Array<string>),
      true
    )
    .addForeignKey('Cip1852Wrapper_ConceptualWallet', {
      local: Cip1852WrapperSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addForeignKey('Cip1852Wrapper_KeyDerivation', {
      local: Cip1852WrapperSchema.properties.PrivateDeriverKeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addNullable([
      Cip1852WrapperSchema.properties.SignerLevel,
      Cip1852WrapperSchema.properties.PrivateDeriverLevel,
      Cip1852WrapperSchema.properties.PrivateDeriverKeyDerivationId,
    ]);
  // Cip1852ToPublicDeriver Tables
  schemaBuilder.createTable(Cip1852ToPublicDeriverSchema.name)
    .addColumn(Cip1852ToPublicDeriverSchema.properties.Cip1852ToPublicDeriverId, Type.INTEGER)
    .addColumn(Cip1852ToPublicDeriverSchema.properties.Cip1852WrapperId, Type.INTEGER)
    .addColumn(Cip1852ToPublicDeriverSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(Cip1852ToPublicDeriverSchema.properties.Index, Type.INTEGER)
    .addPrimaryKey(
      ([Cip1852ToPublicDeriverSchema.properties.Cip1852ToPublicDeriverId]: Array<string>),
      true
    )
    .addForeignKey('Cip1852ToPublicDeriver_PublicDeriver', {
      local: Cip1852ToPublicDeriverSchema.properties.PublicDeriverId,
      ref: `${PublicDeriverSchema.name}.${PublicDeriverSchema.properties.PublicDeriverId}`
    })
    .addForeignKey('Cip1852ToPublicDeriver_Cip1852Wrapper', {
      local: Cip1852ToPublicDeriverSchema.properties.Cip1852WrapperId,
      ref: `${Cip1852WrapperSchema.name}.${Cip1852WrapperSchema.properties.Cip1852WrapperId}`
    })
    .addIndex(
      'Cip1852ToPublicDeriver_Cip1852Wrapper_Index',
      ([Cip1852ToPublicDeriverSchema.properties.Cip1852WrapperId]: Array<string>),
      false
    );
};
