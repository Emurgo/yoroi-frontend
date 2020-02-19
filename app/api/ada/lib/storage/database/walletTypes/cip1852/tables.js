// @flow

import {
  ConceptualWalletSchema,
} from '../core/tables';
import { Type, ConstraintAction, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';
import { KeyDerivationSchema } from '../../primitives/tables';

export type Cip1852WrapperInsert = {|
  ConceptualWalletId: number,
  SignerLevel: number | null,
  PublicDeriverLevel: number,
  PrivateDeriverLevel: number | null,
  PrivateDeriverKeyDerivationId: number | null,
  /** Need to keep track of root ID to cleanup when wallet is removed */
  RootKeyDerivationId: number,
|};
export type Cip1852WrapperRow = {|
  Cip1852WrapperId: number, // serial
  ...Cip1852WrapperInsert,
|};
export const Cip1852WrapperSchema: {|
  +name: 'Cip1852Wrapper',
  properties: $ObjMapi<Cip1852WrapperRow, ToSchemaProp>,
|} = {
  name: 'Cip1852Wrapper',
  properties: {
    Cip1852WrapperId: 'Cip1852WrapperId',
    ConceptualWalletId: 'ConceptualWalletId',
    SignerLevel: 'SignerLevel',
    PublicDeriverLevel: 'PublicDeriverLevel',
    PrivateDeriverLevel: 'PrivateDeriverLevel',
    PrivateDeriverKeyDerivationId: 'PrivateDeriverKeyDerivationId',
    RootKeyDerivationId: 'RootKeyDerivationId',
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
    .addColumn(Cip1852WrapperSchema.properties.RootKeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Cip1852WrapperSchema.properties.Cip1852WrapperId]: Array<string>),
      true
    )
    .addForeignKey('Cip1852Wrapper_ConceptualWallet', {
      local: Cip1852WrapperSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('Cip1852Wrapper_KeyDerivation', {
      local: Cip1852WrapperSchema.properties.PrivateDeriverKeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`,
    })
    .addNullable([
      Cip1852WrapperSchema.properties.SignerLevel,
      Cip1852WrapperSchema.properties.PrivateDeriverLevel,
      Cip1852WrapperSchema.properties.PrivateDeriverKeyDerivationId,
    ]);
};
