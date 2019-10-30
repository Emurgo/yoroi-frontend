// @flow

import {
  AddressSchema,
  KeyDerivationSchema,
} from '../../primitives/tables';
import { Bip44WrapperSchema } from '../bip44/tables';
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export type PrivateDeriverInsert = {|
  Bip44WrapperId: number,
  KeyDerivationId: number,
  Level: number,
|};
export type PrivateDeriverRow = {|
  PrivateDeriverId: number, // serial
  ...PrivateDeriverInsert,
|};
export const PrivateDeriverSchema: {
  +name: 'PrivateDeriver',
  properties: $ObjMapi<PrivateDeriverRow, ToSchemaProp>
} = {
  name: 'PrivateDeriver',
  properties: {
    PrivateDeriverId: 'PrivateDeriverId',
    Bip44WrapperId: 'Bip44WrapperId',
    KeyDerivationId: 'KeyDerivationId',
    Level: 'Level',
  }
};

export type Bip44RootInsert = {|
  KeyDerivationId: number,
|};
export type Bip44RootRow = {|
  Bip44RootId: number,
  ...Bip44RootInsert,
|};
export const Bip44RootSchema: {
  +name: 'Bip44Root',
  properties: $ObjMapi<Bip44RootRow, ToSchemaProp>
} = {
  name: 'Bip44Root',
  properties: {
    Bip44RootId: 'Bip44RootId',
    KeyDerivationId: 'KeyDerivationId',
  }
};
export type Bip44PurposeInsert = {|
  KeyDerivationId: number,
|};
export type Bip44PurposeRow = {|
  Bip44PurposeId: number,
  ...Bip44PurposeInsert,
|};
export const Bip44PurposeSchema: {
  +name: 'Bip44Purpose',
  properties: $ObjMapi<Bip44PurposeRow, ToSchemaProp>
} = {
  name: 'Bip44Purpose',
  properties: {
    Bip44PurposeId: 'Bip44PurposeId',
    KeyDerivationId: 'KeyDerivationId',
  }
};
export type Bip44CoinTypeInsert = {|
  KeyDerivationId: number,
|};
export type Bip44CoinTypeRow = {|
  Bip44CoinTypeId: number,
  ...Bip44CoinTypeInsert,
|};
export const Bip44CoinTypeSchema: {
  +name:'Bip44CoinType',
  properties: $ObjMapi<Bip44CoinTypeRow, ToSchemaProp>
} = {
  name: 'Bip44CoinType',
  properties: {
    Bip44CoinTypeId: 'Bip44CoinTypeId',
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
export const Bip44AccountSchema: {
  +name: 'Bip44Account',
  properties: $ObjMapi<Bip44AccountRow, ToSchemaProp>
} = {
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
export const Bip44ChainSchema: {
  +name: 'Bip44Chain',
  properties: $ObjMapi<Bip44ChainRow, ToSchemaProp>
} = {
  name: 'Bip44Chain',
  properties: {
    Bip44ChainId: 'Bip44ChainId',
    KeyDerivationId: 'KeyDerivationId',
    DisplayCutoff: 'DisplayCutoff',
  }
};
export type Bip44AddressInsert = {|
  KeyDerivationId: number,
  AddressId: number,
|};
export type Bip44AddressRow = {|
  Bip44AddressId: number,
  ...Bip44AddressInsert,
|};
export const Bip44AddressSchema: {
  +name: 'Bip44Address',
  properties: $ObjMapi<Bip44AddressRow, ToSchemaProp>
} = {
  name: 'Bip44Address',
  properties: {
    Bip44AddressId: 'Bip44AddressId',
    KeyDerivationId: 'KeyDerivationId',
    /**
     * We need to specify an index into another table instead of storing the hash here directly
     * This is because we need an address table entry for every input & output in a transaction
     * even if it doesn't belong to you.
     * We can't make that a foreign key to this table because this table has a "KeyDerivationId"
     * We can't make the "KeyDerivationId" nullable because you can't create an index on a nullable
     */
    AddressId: 'AddressId',
  }
};

export type AccountingDerivationInsert = {|
  KeyDerivationId: number,
  AddressId: number,
|};
export type AccountingDerivationRow = {|
  AccountingDerivationId: number,
  ...AccountingDerivationInsert,
|};
/**
 * We don't cache the spending counter here
 * As it would be hard to deal with rollbacks
 */
export const AccountingDerivationSchema: {
  +name: 'AccountingDerivation',
  properties: $ObjMapi<AccountingDerivationRow, ToSchemaProp>
} = {
  name: 'AccountingDerivation',
  properties: {
    AccountingDerivationId: 'AccountingDerivationId',
    KeyDerivationId: 'KeyDerivationId',
    AddressId: 'AddressId',
  }
};

export const populateCommonDb = (schemaBuilder: lf$schema$Builder) => {
  // PrivateDeriver
  schemaBuilder.createTable(PrivateDeriverSchema.name)
    .addColumn(PrivateDeriverSchema.properties.PrivateDeriverId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.Level, Type.INTEGER)
    .addPrimaryKey(
      ([PrivateDeriverSchema.properties.PrivateDeriverId]: Array<string>),
      true
    )
    // TODO: need to swap dependency order and move to /core/
    .addForeignKey('PrivateDeriver_Bip44Wrapper', {
      local: PrivateDeriverSchema.properties.Bip44WrapperId,
      ref: `${Bip44WrapperSchema.name}.${Bip44WrapperSchema.properties.Bip44WrapperId}`
    })
    .addForeignKey('PrivateDeriver_Bip44Derivation', {
      local: PrivateDeriverSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });

  // Bip44Root
  schemaBuilder.createTable(Bip44RootSchema.name)
    .addColumn(Bip44RootSchema.properties.Bip44RootId, Type.INTEGER)
    .addColumn(Bip44RootSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44RootSchema.properties.Bip44RootId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Root_Bip44Derivation', {
      local: Bip44RootSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // Bip44Purpose
  schemaBuilder.createTable(Bip44PurposeSchema.name)
    .addColumn(Bip44PurposeSchema.properties.Bip44PurposeId, Type.INTEGER)
    .addColumn(Bip44PurposeSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44PurposeSchema.properties.Bip44PurposeId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Purpose_Bip44Derivation', {
      local: Bip44PurposeSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    });
  // Bip44CoinType
  schemaBuilder.createTable(Bip44CoinTypeSchema.name)
    .addColumn(Bip44CoinTypeSchema.properties.Bip44CoinTypeId, Type.INTEGER)
    .addColumn(Bip44CoinTypeSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44CoinTypeSchema.properties.Bip44CoinTypeId]: Array<string>),
      true
    )
    .addForeignKey('Bip44CoinType_Bip44Derivation', {
      local: Bip44CoinTypeSchema.properties.KeyDerivationId,
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
  // Bip44Address
  schemaBuilder.createTable(Bip44AddressSchema.name)
    .addColumn(Bip44AddressSchema.properties.Bip44AddressId, Type.INTEGER)
    .addColumn(Bip44AddressSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(Bip44AddressSchema.properties.AddressId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44AddressSchema.properties.Bip44AddressId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Address_Bip44Derivation', {
      local: Bip44AddressSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`
    })
    .addForeignKey('Bip44Address_AddressId', {
      local: Bip44AddressSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`
    })
    .addIndex(
      'Bip44Address_KeyDerivation_Index',
      ([Bip44AddressSchema.properties.KeyDerivationId]: Array<string>),
      true
    );
};
