// @flow

import {
  ConceptualWalletSchema,
  KeySchema,
} from '../uncategorized/tables';
import { Type } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export type Bip44DerivationInsert = {|
  PublicKeyId: number | null,
  PrivateKeyId: number | null,
  Index: number | null,
|};
export type Bip44DerivationRow = {|
  Bip44DerivationId: number, // serial
  ...Bip44DerivationInsert,
|};
export const Bip44DerivationSchema: {
  name: 'Bip44Derivation',
  properties: $ObjMapi<Bip44DerivationRow, ToSchemaProp>
} = {
  name: 'Bip44Derivation',
  properties: {
    Bip44DerivationId: 'Bip44DerivationId',
    PrivateKeyId: 'PrivateKeyId',
    PublicKeyId: 'PublicKeyId',
    Index: 'Index',
  }
};

export type Bip44WrapperInsert = {|
  ConceptualWalletId: number,
  IsBundled: boolean,
  SignerLevel: number | null,
  PublicDeriverLevel: number,
  Version: number,
|};
export type Bip44WrapperRow = {|
  Bip44WrapperId: number, // serial
  ...Bip44WrapperInsert,
|};
export const Bip44WrapperSchema: {
  name: 'Bip44Wrapper',
  properties: $ObjMapi<Bip44WrapperRow, ToSchemaProp>
} = {
  name: 'Bip44Wrapper',
  properties: {
    Bip44WrapperId: 'Bip44WrapperId',
    ConceptualWalletId: 'ConceptualWalletId',
    IsBundled: 'IsBundled',
    SignerLevel: 'SignerLevel',
    PublicDeriverLevel: 'PublicDeriverLevel',
    Version: 'Version',
  }
};

export type Bip44DerivationMappingInsert = {|
  Parent: number,
  Child: number,
|};
export type Bip44DerivationMappingRow = {|
  Bip44DerivationMappingId: number, // serial
  ...Bip44DerivationMappingInsert,
|};
export const Bip44DerivationMappingSchema: {
  name: 'Bip44DerivationMapping',
  properties: $ObjMapi<Bip44DerivationMappingRow, ToSchemaProp>
} = {
  name: 'Bip44DerivationMapping',
  properties: {
    Bip44DerivationMappingId: 'Bip44DerivationMappingId',
    Parent: 'Parent',
    Child: 'Child',
  }
};

export type PrivateDeriverInsert = {|
  Bip44WrapperId: number,
  Bip44DerivationId: number,
  Level: number,
|};
export type PrivateDeriverRow = {|
  PrivateDeriverId: number, // serial
  ...PrivateDeriverInsert,
|};
export const PrivateDeriverSchema: {
  name: 'PrivateDeriver',
  properties: $ObjMapi<PrivateDeriverRow, ToSchemaProp>
} = {
  name: 'PrivateDeriver',
  properties: {
    PrivateDeriverId: 'PrivateDeriverId',
    Bip44WrapperId: 'Bip44WrapperId',
    Bip44DerivationId: 'Bip44DerivationId',
    Level: 'Level',
  }
};

export type PublicDeriverInsert = {|
  Bip44DerivationId: number,
  Name: string,
  LastBlockSync: number,
|};
export type PublicDeriverRow = {|
  PublicDeriverId: number, // serial
  ...PublicDeriverInsert,
|};
export const PublicDeriverSchema: {
  name: 'PublicDeriver',
  properties: $ObjMapi<PublicDeriverRow, ToSchemaProp>
} = {
  name: 'PublicDeriver',
  properties: {
    PublicDeriverId: 'PublicDeriverId',
    Bip44DerivationId: 'Bip44DerivationId',
    Name: 'Name',
    LastBlockSync: 'LastBlockSync',
  }
};

export type Bip44RootInsert = {|
  Bip44DerivationId: number,
|};
export type Bip44RootRow = {|
  Bip44RootId: number,
  ...Bip44RootInsert,
|};
export const Bip44RootSchema: {
  name: 'Bip44Root',
  properties: $ObjMapi<Bip44RootRow, ToSchemaProp>
} = {
  name: 'Bip44Root',
  properties: {
    Bip44RootId: 'Bip44RootId',
    Bip44DerivationId: 'Bip44DerivationId',
  }
};
export type Bip44PurposeInsert = {|
  Bip44DerivationId: number,
|};
export type Bip44PurposeRow = {|
  Bip44PurposeId: number,
  ...Bip44PurposeInsert,
|};
export const Bip44PurposeSchema: {
  name: 'Bip44Purpose',
  properties: $ObjMapi<Bip44PurposeRow, ToSchemaProp>
} = {
  name: 'Bip44Purpose',
  properties: {
    Bip44PurposeId: 'Bip44PurposeId',
    Bip44DerivationId: 'Bip44DerivationId',
  }
};
export type Bip44CoinTypeInsert = {|
  Bip44DerivationId: number,
|};
export type Bip44CoinTypeRow = {|
  Bip44CoinTypeId: number,
  ...Bip44CoinTypeInsert,
|};
export const Bip44CoinTypeSchema: {
  name:'Bip44CoinType',
  properties: $ObjMapi<Bip44CoinTypeRow, ToSchemaProp>
} = {
  name: 'Bip44CoinType',
  properties: {
    Bip44CoinTypeId: 'Bip44CoinTypeId',
    Bip44DerivationId: 'Bip44DerivationId',
  }
};
export type Bip44AccountInsert = {|
  Bip44DerivationId: number,
|};
export type Bip44AccountRow = {|
  Bip44AccountId: number,
  ...Bip44AccountInsert,
|};
export const Bip44AccountSchema: {
  name: 'Bip44Account',
  properties: $ObjMapi<Bip44AccountRow, ToSchemaProp>
} = {
  name: 'Bip44Account',
  properties: {
    Bip44AccountId: 'Bip44AccountId',
    Bip44DerivationId: 'Bip44DerivationId',
  }
};
export type Bip44ChainInsert = {|
  Bip44DerivationId: number,
  LastReceiveIndex: number | null,
|};
export type Bip44ChainRow = {|
  Bip44ChainId: number,
  ...Bip44ChainInsert,
|};
export const Bip44ChainSchema: {
  name: 'Bip44Chain',
  properties: $ObjMapi<Bip44ChainRow, ToSchemaProp>
} = {
  name: 'Bip44Chain',
  properties: {
    Bip44ChainId: 'Bip44ChainId',
    Bip44DerivationId: 'Bip44DerivationId',
    LastReceiveIndex: 'LastReceiveIndex',
  }
};
export type Bip44AddressInsert = {|
  Bip44DerivationId: number,
  Hash: string,
|};
export type Bip44AddressRow = {|
  Bip44AddressId: number,
  ...Bip44AddressInsert,
|};
export const Bip44AddressSchema: {
  name: 'Bip44Address',
  properties: $ObjMapi<Bip44AddressRow, ToSchemaProp>
} = {
  name: 'Bip44Address',
  properties: {
    Bip44AddressId: 'Bip44AddressId',
    Bip44DerivationId: 'Bip44DerivationId',
    Hash: 'Hash',
  }
};

/** Ensure we are only creating a single instance of the lovefield database */
export const populateBip44Db = (schemaBuilder: lf$schema$Builder) => {
  // Bip44Derivation Table
  schemaBuilder.createTable(Bip44DerivationSchema.name)
    .addColumn(Bip44DerivationSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addColumn(Bip44DerivationSchema.properties.PrivateKeyId, Type.INTEGER)
    .addColumn(Bip44DerivationSchema.properties.PublicKeyId, Type.INTEGER)
    .addColumn(Bip44DerivationSchema.properties.Index, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44DerivationSchema.properties.Bip44DerivationId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Derivation_PrivateKeyId', {
      local: Bip44DerivationSchema.properties.PrivateKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`
    })
    .addForeignKey('Bip44Derivation_PublicKeyId', {
      local: Bip44DerivationSchema.properties.PublicKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`
    })
    .addNullable([
      Bip44DerivationSchema.properties.PrivateKeyId,
      Bip44DerivationSchema.properties.PublicKeyId,
      Bip44DerivationSchema.properties.Index,
    ]);

  // Bip44Wrapper Table
  schemaBuilder.createTable(Bip44WrapperSchema.name)
    .addColumn(Bip44WrapperSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.ConceptualWalletId, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.IsBundled, Type.BOOLEAN)
    .addColumn(Bip44WrapperSchema.properties.SignerLevel, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.PublicDeriverLevel, Type.INTEGER)
    .addColumn(Bip44WrapperSchema.properties.Version, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44WrapperSchema.properties.Bip44WrapperId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Wrapper_ConceptualWallet', {
      local: Bip44WrapperSchema.properties.ConceptualWalletId,
      ref: `${ConceptualWalletSchema.name}.${ConceptualWalletSchema.properties.ConceptualWalletId}`
    })
    .addNullable([
      Bip44WrapperSchema.properties.SignerLevel,
    ]);

  // Bip44DerivationMappingTable
  schemaBuilder.createTable(Bip44DerivationMappingSchema.name)
    .addColumn(Bip44DerivationMappingSchema.properties.Bip44DerivationMappingId, Type.INTEGER)
    .addColumn(Bip44DerivationMappingSchema.properties.Parent, Type.INTEGER)
    .addColumn(Bip44DerivationMappingSchema.properties.Child, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44DerivationMappingSchema.properties.Bip44DerivationMappingId]: Array<string>),
      true
    )
    .addForeignKey('Bip44DerivationMapping_Parent', {
      local: Bip44DerivationMappingSchema.properties.Parent,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    })
    .addForeignKey('Bip44DerivationMapping_Child', {
      local: Bip44DerivationMappingSchema.properties.Child,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    })
    .addIndex(
      'Bip44DerivationMapping_ParentId',
      ([Bip44DerivationMappingSchema.properties.Parent]: Array<string>),
      false,
    );

  // PrivateDeriver
  schemaBuilder.createTable(PrivateDeriverSchema.name)
    .addColumn(PrivateDeriverSchema.properties.PrivateDeriverId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.Bip44WrapperId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addColumn(PrivateDeriverSchema.properties.Level, Type.INTEGER)
    .addPrimaryKey(
      ([PrivateDeriverSchema.properties.PrivateDeriverId]: Array<string>),
      true
    )
    .addForeignKey('PrivateDeriver_Bip44Wrapper', {
      local: PrivateDeriverSchema.properties.Bip44WrapperId,
      ref: `${Bip44WrapperSchema.name}.${Bip44WrapperSchema.properties.Bip44WrapperId}`
    })
    .addForeignKey('PrivateDeriver_Bip44Derivation', {
      local: PrivateDeriverSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });

  // PublicDeriver
  schemaBuilder.createTable(PublicDeriverSchema.name)
    .addColumn(PublicDeriverSchema.properties.PublicDeriverId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addColumn(PublicDeriverSchema.properties.Name, Type.STRING)
    .addColumn(PublicDeriverSchema.properties.LastBlockSync, Type.INTEGER)
    .addPrimaryKey(
      ([PublicDeriverSchema.properties.PublicDeriverId]: Array<string>),
      true
    )
    .addForeignKey('PublicDeriver_Bip44Derivation', {
      local: PublicDeriverSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });

  // Bip44Root
  schemaBuilder.createTable(Bip44RootSchema.name)
    .addColumn(Bip44RootSchema.properties.Bip44RootId, Type.INTEGER)
    .addColumn(Bip44RootSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44RootSchema.properties.Bip44RootId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Root_Bip44Derivation', {
      local: Bip44RootSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });
  // Bip44Purpose
  schemaBuilder.createTable(Bip44PurposeSchema.name)
    .addColumn(Bip44PurposeSchema.properties.Bip44PurposeId, Type.INTEGER)
    .addColumn(Bip44PurposeSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44PurposeSchema.properties.Bip44PurposeId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Purpose_Bip44Derivation', {
      local: Bip44PurposeSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });
  // Bip44CoinType
  schemaBuilder.createTable(Bip44CoinTypeSchema.name)
    .addColumn(Bip44CoinTypeSchema.properties.Bip44CoinTypeId, Type.INTEGER)
    .addColumn(Bip44CoinTypeSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44CoinTypeSchema.properties.Bip44CoinTypeId]: Array<string>),
      true
    )
    .addForeignKey('Bip44CoinType_Bip44Derivation', {
      local: Bip44CoinTypeSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });
  // Bip44Account
  schemaBuilder.createTable(Bip44AccountSchema.name)
    .addColumn(Bip44AccountSchema.properties.Bip44AccountId, Type.INTEGER)
    .addColumn(Bip44AccountSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44AccountSchema.properties.Bip44AccountId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Account_Bip44Derivation', {
      local: Bip44AccountSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });
  // Bip44Chain
  schemaBuilder.createTable(Bip44ChainSchema.name)
    .addColumn(Bip44ChainSchema.properties.Bip44ChainId, Type.INTEGER)
    .addColumn(Bip44ChainSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addColumn(Bip44ChainSchema.properties.LastReceiveIndex, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44ChainSchema.properties.Bip44ChainId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Chain_Bip44Derivation', {
      local: Bip44ChainSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    })
    .addNullable([
      Bip44ChainSchema.properties.LastReceiveIndex,
    ]);
  // Bip44Address
  schemaBuilder.createTable(Bip44AddressSchema.name)
    .addColumn(Bip44AddressSchema.properties.Bip44AddressId, Type.INTEGER)
    .addColumn(Bip44AddressSchema.properties.Bip44DerivationId, Type.INTEGER)
    .addPrimaryKey(
      ([Bip44AddressSchema.properties.Bip44AddressId]: Array<string>),
      true
    )
    .addForeignKey('Bip44Address_Bip44Derivation', {
      local: Bip44AddressSchema.properties.Bip44DerivationId,
      ref: `${Bip44DerivationSchema.name}.${Bip44DerivationSchema.properties.Bip44DerivationId}`
    });
};
