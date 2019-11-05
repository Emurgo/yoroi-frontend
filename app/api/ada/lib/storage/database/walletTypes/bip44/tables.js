// @flow

import {
  ConceptualWalletSchema,
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
};
