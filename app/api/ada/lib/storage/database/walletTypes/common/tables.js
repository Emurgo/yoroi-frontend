// @flow

import {
  KeyDerivationSchema,
} from '../../primitives/tables';
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export type RootDerivationInsert = {|
  KeyDerivationId: number,
|};
export type RootDerivationRow = {|
  RootDerivationId: number,
  ...RootDerivationInsert,
|};
export const RootDerivationSchema: {|
  +name: 'RootDerivation',
  properties: $ObjMapi<RootDerivationRow, ToSchemaProp>,
|} = {
  name: 'RootDerivation',
  properties: {
    RootDerivationId: 'RootDerivationId',
    KeyDerivationId: 'KeyDerivationId',
  }
};

export type PurposeDerivationInsert = {|
  KeyDerivationId: number,
|};
export type PurposeDerivationRow = {|
  PurposeDerivationId: number,
  ...PurposeDerivationInsert,
|};
/**
 * Note: we use "wrappers" instead of specifying any information in here
 *
 * We could choose to add the wrappers as different BIP32 tables
 * since we could infer which wrapper table to query by looking at the derivation index
 * we're guaranteed every level exists because even in the ad-hoc case we can add empty derivations
 *
 * pros: allows many different purposes for a single conceptual wallet
 * cons: slower because to query the purpose for every public deriver individually
 * cons: doesn't work for wallets which have no actual purpose
 *  ex:
 *    - smart contract wallets
 *    - address checker wallet
 *        don't know what purpose these were derived from so it's strange to assign a purpose
 *        that is not actually a bip32 purpose but rather a semantic specification
 */
export const PurposeDerivationSchema: {|
  +name: 'PurposeDerivation',
  properties: $ObjMapi<PurposeDerivationRow, ToSchemaProp>,
|} = {
  name: 'PurposeDerivation',
  properties: {
    PurposeDerivationId: 'PurposeDerivationId',
    KeyDerivationId: 'KeyDerivationId',
  }
};
export type CoinTypeDerivationInsert = {|
  KeyDerivationId: number,
|};
export type CoinTypeDerivationRow = {|
  CoinTypeDerivationId: number,
  ...CoinTypeDerivationInsert,
|};
export const CoinTypeDerivationSchema: {|
  +name:'CoinTypeDerivation',
  properties: $ObjMapi<CoinTypeDerivationRow, ToSchemaProp>,
|} = {
  name: 'CoinTypeDerivation',
  properties: {
    CoinTypeDerivationId: 'CoinTypeDerivationId',
    KeyDerivationId: 'KeyDerivationId',
  }
};
export type Bip44AccountInsert = {|
  KeyDerivationId: number,
|};
export type Bip44AccountRow = {|
  Bip44AccountId: number,
  ...Bip44AccountInsert,
|};
export const Bip44AccountSchema: {|
  +name: 'Bip44Account',
  properties: $ObjMapi<Bip44AccountRow, ToSchemaProp>,
|} = {
  name: 'Bip44Account',
  properties: {
    Bip44AccountId: 'Bip44AccountId',
    KeyDerivationId: 'KeyDerivationId',
  }
};

export type Bip44ChainInsert = {|
  KeyDerivationId: number,
  DisplayCutoff: number | null,
|};
export type Bip44ChainRow = {|
  Bip44ChainId: number,
  ...Bip44ChainInsert,
|};
export const Bip44ChainSchema: {|
  +name: 'Bip44Chain',
  properties: $ObjMapi<Bip44ChainRow, ToSchemaProp>,
|} = {
  name: 'Bip44Chain',
  properties: {
    Bip44ChainId: 'Bip44ChainId',
    KeyDerivationId: 'KeyDerivationId',
    DisplayCutoff: 'DisplayCutoff',
  }
};

export const populateCommonDb = (schemaBuilder: lf$schema$Builder) => {
  // RootDerivation
  schemaBuilder.createTable(RootDerivationSchema.name)
    .addColumn(RootDerivationSchema.properties.RootDerivationId, Type.INTEGER)
    .addColumn(RootDerivationSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([RootDerivationSchema.properties.RootDerivationId]: Array<string>),
      true
    )
    .addForeignKey('RootDerivation_Bip44Derivation', {
      local: RootDerivationSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // PurposeDerivation
  schemaBuilder.createTable(PurposeDerivationSchema.name)
    .addColumn(PurposeDerivationSchema.properties.PurposeDerivationId, Type.INTEGER)
    .addColumn(PurposeDerivationSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([PurposeDerivationSchema.properties.PurposeDerivationId]: Array<string>),
      true
    )
    .addForeignKey('PurposeDerivation_Bip44Derivation', {
      local: PurposeDerivationSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // CoinTypeDerivation
  schemaBuilder.createTable(CoinTypeDerivationSchema.name)
    .addColumn(CoinTypeDerivationSchema.properties.CoinTypeDerivationId, Type.INTEGER)
    .addColumn(CoinTypeDerivationSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([CoinTypeDerivationSchema.properties.CoinTypeDerivationId]: Array<string>),
      true
    )
    .addForeignKey('CoinTypeDerivation_Bip44Derivation', {
      local: CoinTypeDerivationSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // Bip44Account
  schemaBuilder.createTable(Bip44AccountSchema.name)
    .addColumn(Bip44AccountSchema.properties.Bip44AccountId, Type.INTEGER)
    .addColumn(Bip44AccountSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44AccountSchema.properties.Bip44AccountId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Account_Bip44Derivation', {
      local: Bip44AccountSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // Bip44Chain
  schemaBuilder.createTable(Bip44ChainSchema.name)
    .addColumn(Bip44ChainSchema.properties.Bip44ChainId, Type.INTEGER)
    .addColumn(Bip44ChainSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(Bip44ChainSchema.properties.DisplayCutoff, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44ChainSchema.properties.Bip44ChainId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Chain_Bip44Derivation', {
      local: Bip44ChainSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addNullable([
      Bip44ChainSchema.properties.DisplayCutoff,
    ]);
};
