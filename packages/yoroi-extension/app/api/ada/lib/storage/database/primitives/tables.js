// @flow

import type { lf$schema$Builder } from 'lovefield';
import { ConstraintAction, ConstraintTiming, Type } from 'lovefield';

import type { CertificateRelationType, CoreAddressT, TxStatusCodesType } from './enums';
import type { KeyKindType } from '../../../cardanoCrypto/keys/types';
import type { CoinTypesT } from '../../../../../../config/numbersConfig';
import typeof { CertificateKind } from '@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib';

export type CommonBaseConfig = {|
  /**
   * At what point the config becomes active
   */
  +StartAt: number,
  /**
    many blockchains require a different kind of magic number or string to identify a network
    ex: hash of the genesis block or 0=mainnet,1=testnet, etc.
  */
  +ChainNetworkId: string,
|};
export type CardanoHaskellByronBaseConfig = {|
  ...CommonBaseConfig,
  /*
   * Legacy byron addresses contained a network id inside of its attributes
   * This network id was a 32-bit number, but the bech32 ID is smaller
   * Therefore, the Byron network ID is only used to generate legacy addresses
   */
  +ByronNetworkId: number,
  +GenesisDate: string,
  +SlotsPerEpoch: number,
  +SlotDuration: number,
|};
export type CardanoHaskellShelleyBaseConfig = {|
  +StartAt: number,
  +SlotsPerEpoch: number,
  +SlotDuration: number,
  // based on https://staking.cardano.org/en/calculator/
  +PerEpochPercentageReward: number,
  +LinearFee: {|
    +coefficient: string,
    +constant: string,
  |},
  +MinimumUtxoVal: string,
  +CoinsPerUtxoWord: string,
  +PoolDeposit: string,
  +KeyDeposit: string,
|};
export type CardanoHaskellBaseConfig = [$ReadOnly<CardanoHaskellByronBaseConfig>, $ReadOnly<CardanoHaskellShelleyBaseConfig>];

// unfortunate hack to get around the fact tuple spreading is broken in Flow
export type CardanoHaskellConfig = $ReadOnly<
  InexactSubset<{|
    ...$ElementType<CardanoHaskellBaseConfig, 0>,
    ...$ElementType<CardanoHaskellBaseConfig, 1>,
  |}>
>;

export type NetworkInsert = {|
  NetworkId: number,
  NetworkName: string,
  CoinType: CoinTypesT,
  Backend: {|
    BackendService?: string,
    TokenInfoService?: string,
    BackendServiceZero?: string,
  |},
  /**
   * Starting configuration for the wallet.
   * This is meant for protocol parameters that rarely change
   * This allows wallets to work without ever connecting to a network
   * Keep in mind parameters in here can change over time
   * Ex: on-chain governance
   * HOWEVER, a new field shouldn't be introduced externally.
   * Only updates to fields specified here.
   * For these updates, you need to query a full node for current parameters
   */
  BaseConfig: CardanoHaskellBaseConfig,
  /**
   * Some currencies have totally different implementations that use the same coin type
   * To differentiate these, we need some identifier of the fork
   */
  Fork: number,
|};
export type NetworkRow = {|
  ...NetworkInsert,
|};
export const NetworkSchema: {|
  +name: 'Network',
  properties: $ObjMapi<NetworkRow, ToSchemaProp>,
|} = {
  name: 'Network',
  properties: {
    NetworkId: 'NetworkId',
    NetworkName: 'NetworkName',
    CoinType: 'CoinType',
    Backend: 'Backend',
    BaseConfig: 'BaseConfig',
    Fork: 'Fork',
  },
};

export type KeyInsert = {|
  Hash: string,
  IsEncrypted: boolean,
  Type: KeyKindType,
  PasswordLastUpdate: Date | null,
|};
export type KeyRow = {|
  KeyId: number,
  ...KeyInsert,
|};
export const KeySchema: {|
  +name: 'Key',
  properties: $ObjMapi<KeyRow, ToSchemaProp>,
|} = {
  name: 'Key',
  properties: {
    KeyId: 'KeyId',
    Type: 'Type',
    Hash: 'Hash',
    IsEncrypted: 'IsEncrypted',
    PasswordLastUpdate: 'PasswordLastUpdate',
  },
};

export type AddressInsert = {|
  Digest: number,
  Type: CoreAddressT,
  Hash: string,
  IsUsed: boolean,
|};
export type AddressRow = {|
  AddressId: number,
  ...AddressInsert,
|};
export const AddressSchema: {|
  +name: 'Address',
  properties: $ObjMapi<AddressRow, ToSchemaProp>,
|} = {
  name: 'Address',
  properties: {
    AddressId: 'AddressId',
    Digest: 'Digest',
    Type: 'Type',
    Hash: 'Hash',
    IsUsed: 'IsUsed',
  },
};

export type EncryptionMetaInsert = {|
  EncryptionMetaId: number,
  /**
   * Need a seed for hashing
   * or you could easily make a rainbow table for the whole blockchain
   */
  AddressSeed: number,
  TransactionSeed: number,
  BlockSeed: number,
  TokenSeed: number,
|};
export type EncryptionMetaRow = {|
  ...EncryptionMetaInsert,
|};
export const EncryptionMetaSchema: {|
  +name: 'EncryptionMeta',
  properties: $ObjMapi<EncryptionMetaRow, ToSchemaProp>,
|} = {
  name: 'EncryptionMeta',
  properties: {
    EncryptionMetaId: 'EncryptionMetaId',
    AddressSeed: 'AddressSeed',
    TransactionSeed: 'TransactionSeed',
    BlockSeed: 'BlockSeed',
    TokenSeed: 'TokenSeed',
  },
};

export type KeyDerivationInsert = {|
  PublicKeyId: number | null,
  PrivateKeyId: number | null,
  Parent: number | null, // no parent in root case
  /**
   * No index in root case
   * Additionally, this is useful for adhoc wallet
   * since it allows us to put empty derivations in a derivation chain
   *
   * ex: adhoc change chain so we don't know the account
   * but we can still specify the purpose & cointype by adding an empty account derivation
   */
  Index: number | null, // no index in root case
|};
export type KeyDerivationRow = {|
  KeyDerivationId: number, // serial
  ...KeyDerivationInsert,
|};
export const KeyDerivationSchema: {|
  +name: 'KeyDerivation',
  properties: $ObjMapi<KeyDerivationRow, ToSchemaProp>,
|} = {
  name: 'KeyDerivation',
  properties: {
    KeyDerivationId: 'KeyDerivationId',
    PrivateKeyId: 'PrivateKeyId',
    PublicKeyId: 'PublicKeyId',
    Parent: 'Parent',
    Index: 'Index',
  },
};

export type BlockInsert = {|
  SlotNum: number,
  /**
   * Height != SlotNum since height skips empty slots
   */
  Height: number,
  Digest: number,
  Hash: string,
  BlockTime: Date,
|};
export type BlockRow = {|
  BlockId: number,
  ...BlockInsert,
|};
export const BlockSchema: {|
  +name: 'Block',
  properties: $ObjMapi<BlockRow, ToSchemaProp>,
|} = {
  name: 'Block',
  properties: {
    BlockId: 'BlockId',
    SlotNum: 'SlotNum',
    Height: 'Height',
    Digest: 'Digest',
    Hash: 'Hash',
    BlockTime: 'BlockTime',
  },
};

export type DbBlock = {|
  +block: $ReadOnly<BlockRow>,
|};

export const TransactionType = Object.freeze({
  CardanoByron: 0,
  CardanoShelley: 1,
});

export type TransactionInsertBase = {|
  Digest: number,
  Hash: string,
  BlockId: null | number,
  Ordinal: null | number, // index within the block
  /**
   * Need this otherwise we wouldn't be able to sort transactions by time
   * Can't only use slot+epoch as these aren't available for pending/failed txs
   */
  LastUpdateTime: number,
  Status: TxStatusCodesType,
  ErrorMessage: string | null,
|};
export type CardanoByronTransactionInsert = {|
  Type: $PropertyType<typeof TransactionType, 'CardanoByron'>,
  Extra: null,
  ...TransactionInsertBase,
|};
export type CardanoShelleyTransactionInsert = {|
  Type: $PropertyType<typeof TransactionType, 'CardanoShelley'>,
  Extra: {|
    Fee: string,
    Ttl?: string,
    // A backend update changed metadata to raw hex to parsed JSON, so this field
    // may either be string (old data stored before the change) or Object (new data)
    Metadata: null | string | Object,
    // note if this field is not present, the tx is *valid*
    IsValid?: boolean,
  |},
  ...TransactionInsertBase,
|};

export type TransactionInsert = CardanoByronTransactionInsert | CardanoShelleyTransactionInsert;

export type TransactionRow = {|
  TransactionId: number,
  ...TransactionInsert,
|};

export const TransactionSchema: {|
  +name: 'Transaction',
  properties: $ObjMapi<TransactionRow, ToSchemaProp>,
|} = {
  name: 'Transaction',
  properties: {
    TransactionId: 'TransactionId',
    Type: 'Type',
    Digest: 'Digest',
    Hash: 'Hash',
    BlockId: 'BlockId',
    Ordinal: 'Ordinal',
    LastUpdateTime: 'LastUpdateTime',
    Status: 'Status',
    ErrorMessage: 'ErrorMessage',
    Extra: 'Extra',
  },
};

export type CertificatePart = {|
  relatedAddresses: $ReadOnlyArray<$ReadOnly<CertificateAddressRow>>,
  certificate: $ReadOnly<CertificateRow>,
|};

export type CertificateInsert = {|
  TransactionId: number,
  Ordinal: number, // transactions can contain multiple certificates in some blockchains
  Kind: $Values<CertificateKind>,
  // <TODO:PENDING_REMOVAL> Needs redesign
  Payload: string,
|};
export type CertificateRow = {|
  CertificateId: number,
  ...CertificateInsert,
|};
export const CertificateSchema: {|
  +name: 'Certificate',
  properties: $ObjMapi<CertificateRow, ToSchemaProp>,
|} = {
  name: 'Certificate',
  properties: {
    CertificateId: 'CertificateId',
    TransactionId: 'TransactionId',
    Ordinal: 'Ordinal',
    Kind: 'Kind',
    Payload: 'Payload',
  },
};
export type CertificateAddressInsert = {|
  CertificateId: number,
  AddressId: number,
  Relation: CertificateRelationType,
|};
export type CertificateAddressRow = {|
  CertificateAddressId: number,
  ...CertificateAddressInsert,
|};

export const CertificateAddressSchema: {|
  +name: 'CertificateAddress',
  properties: $ObjMapi<CertificateAddressRow, ToSchemaProp>,
|} = {
  name: 'CertificateAddress',
  properties: {
    CertificateAddressId: 'CertificateAddressId',
    CertificateId: 'CertificateId',
    AddressId: 'AddressId',
    Relation: 'Relation',
  },
};

export type CanonicalAddressInsert = {|
  KeyDerivationId: number,
|};
export type CanonicalAddressRow = {|
  CanonicalAddressId: number,
  ...CanonicalAddressInsert,
|};
/**
 * We save here a "canonical address" instead of an address type depending on the purpose
 * This is because some cryptocurrencies have multiple addresses per derivation path
 *  ex: group addresses in Cardano Shelley
 * We therefore need a 1-many mapping between canonical to hash
 * but we can only build this mapping if we have 1 table for all purposes
 *  - so we can use foreign key to this known table
 *
 * This means that metadata can't be stored directly here like other derivation levels
 * that's okay since since any metadata would be associated w/ a hash and not the derivation anyway
 */
export const CanonicalAddressSchema: {|
  +name: 'CanonicalAddress',
  properties: $ObjMapi<CanonicalAddressRow, ToSchemaProp>,
|} = {
  name: 'CanonicalAddress',
  properties: {
    CanonicalAddressId: 'CanonicalAddressId',
    KeyDerivationId: 'KeyDerivationId',
  },
};

export type AddressMappingInsert = {|
  KeyDerivationId: number,
  AddressId: number,
|};
export type AddressMappingRow = {|
  AddressMappingId: number,
  ...AddressMappingInsert,
|};
export const AddressMappingSchema: {|
  +name: 'AddressMapping',
  properties: $ObjMapi<AddressMappingRow, ToSchemaProp>,
|} = {
  name: 'AddressMapping',
  properties: {
    AddressMappingId: 'AddressMappingId',
    KeyDerivationId: 'KeyDerivationId',
    /**
     * We need to specify an index into another table instead of storing the hash here directly
     * This is because we need an address table entry for every input & output in a transaction
     * even if it doesn't belong to you.
     * We can't make that a foreign key to this table because this table has a "KeyDerivationId"
     * We can't make the "KeyDerivationId" nullable because you can't create an index on a nullable
     */
    AddressId: 'AddressId',
  },
};

export type NFTMetadata = {|
  name: string,
  image: string | Array<string>,
  mediaType?: ?string,
  description: ?(string | Array<string>),
  authors: ?string,
  author: ?string,
  files?: ?Array<{|
    name?: ?string,
    mediaType?: ?string,
    src?: ?(string | Array<string>),
  |}>,
|};

export type CardanoAssetMintMetadata = {|
  // transaction_metadatum_label: 721 for NFTs
  // See CIP 721
  // https://github.com/cardano-foundation/CIPs/blob/8b1f2f0900d81d6233e9805442c2b42aa1779d2d/CIP-NFTMetadataStandard.md
  [key: string]: {|
    version?: ?string,
    [policyID: string]: {|
      [assetNameHex: string]: NFTMetadata,
    |},
  |},
|};

export type TokenMetadata = {|
  +type: 'Cardano',
  // empty string for ADA
  +policyId: string,
  // empty string for ADA
  +assetName: string,
  numberOfDecimals: number,
  ticker: null | string,
  logo: null | string,
  longName: null | string,
  // If the token row is fetched from network, this is the ISO time string.
  // Otherwise it is null or not present.
  lastUpdatedAt?: ?string,
  +assetMintMetadata?: Array<CardanoAssetMintMetadata>,
|};

export type TokenInsert = {|
  /** different blockchains can support native multi-asset */
  NetworkId: number,
  IsDefault: boolean,
  Digest: number,
  /**
   * for Cardano, this is policyId || assetName
   * Note: we don't use null for the primary token of the chain
   * As some blockchains have multiple primary tokens
   */
  Identifier: string,
  IsNFT?: boolean,
  Metadata: TokenMetadata,
|};
export type TokenUpsertWithDigest =
  | TokenInsert
  | {|
      TokenId?: ?number,
      ...TokenInsert,
    |};
export type TokenUpsert = $Diff<TokenUpsertWithDigest, {| Digest: number |}>;
export type TokenRow = {|
  TokenId: number,
  ...TokenInsert,
|};
export const TokenSchema: {|
  +name: 'Token',
  properties: $ObjMapi<TokenRow, ToSchemaProp>,
|} = {
  name: 'Token',
  properties: {
    TokenId: 'TokenId',
    IsNFT: 'IsNFT',
    IsDefault: 'IsDefault',
    NetworkId: 'NetworkId',
    Digest: 'Digest',
    Identifier: 'Identifier',
    Metadata: 'Metadata',
  },
};

export type TokenListInsert = {|
  ListId: number,
  TokenId: number,
  Amount: string,
|};
export type TokenListRow = {|
  TokenListItemId: number,
  ...TokenListInsert,
|};
/**
 * For outputs that belong to you,
 * utxo outputs are a super-set of inputs because for an address to be an input,
 * it must have received coins (been an output) previously
 */
export const TokenListSchema: {|
  +name: 'TokenList',
  properties: $ObjMapi<TokenListRow, ToSchemaProp>,
|} = {
  name: 'TokenList',
  properties: {
    TokenListItemId: 'TokenListItemId',
    ListId: 'ListId',
    TokenId: 'TokenId',
    Amount: 'Amount',
  },
};

export type DbTransaction = {|
  +transaction: $ReadOnly<TransactionRow>,
|};

export type DbTokenInfo = {|
  +tokens: $ReadOnlyArray<{|
    +TokenList: $ReadOnly<TokenListRow>,
    +Token: $ReadOnly<{|
      TokenId: number,
      Identifier: string,
      NetworkId: number,
    |}>,
  |}>,
|};

export const populatePrimitivesDb = (schemaBuilder: lf$schema$Builder) => {
  // Network Table
  schemaBuilder
    .createTable(NetworkSchema.name)
    .addColumn(NetworkSchema.properties.NetworkId, Type.INTEGER)
    .addColumn(NetworkSchema.properties.NetworkName, Type.STRING)
    .addColumn(NetworkSchema.properties.CoinType, Type.NUMBER)
    .addColumn(NetworkSchema.properties.Backend, Type.OBJECT)
    .addColumn(NetworkSchema.properties.BaseConfig, Type.OBJECT)
    .addColumn(NetworkSchema.properties.Fork, Type.INTEGER)
    .addPrimaryKey(
      /* note: doesn't auto-increment
       * since we may want to support users adding custom networks eventually
       * so we need custom user networks to live in a different ID range than pre-built networks
       * so that if we add any new premade-network, we can just hardcode an ID without conflict
       */
      ([NetworkSchema.properties.NetworkId]: Array<string>)
    );

  // Key Table
  schemaBuilder
    .createTable(KeySchema.name)
    .addColumn(KeySchema.properties.KeyId, Type.INTEGER)
    .addColumn(KeySchema.properties.Type, Type.INTEGER)
    .addColumn(KeySchema.properties.Hash, Type.STRING)
    .addColumn(KeySchema.properties.IsEncrypted, Type.BOOLEAN)
    .addColumn(KeySchema.properties.PasswordLastUpdate, Type.DATE_TIME)
    .addPrimaryKey(([KeySchema.properties.KeyId]: Array<string>), true)
    .addNullable([KeySchema.properties.PasswordLastUpdate]);

  // Address Table
  schemaBuilder
    .createTable(AddressSchema.name)
    .addColumn(AddressSchema.properties.AddressId, Type.INTEGER)
    .addColumn(AddressSchema.properties.Digest, Type.NUMBER)
    .addColumn(AddressSchema.properties.Type, Type.NUMBER)
    .addColumn(AddressSchema.properties.Hash, Type.STRING)
    .addColumn(AddressSchema.properties.IsUsed, Type.BOOLEAN)
    .addPrimaryKey(([AddressSchema.properties.AddressId]: Array<string>), true)
    .addIndex(
      'Address_Digest_Index',
      ([AddressSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    )
    .addIndex('Address_Type_Index', ([AddressSchema.properties.Type]: Array<string>), false);

  // EncryptionMeta Table
  schemaBuilder
    .createTable(EncryptionMetaSchema.name)
    .addColumn(EncryptionMetaSchema.properties.EncryptionMetaId, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.AddressSeed, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.TransactionSeed, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.BlockSeed, Type.INTEGER)
    .addColumn(EncryptionMetaSchema.properties.TokenSeed, Type.INTEGER)
    .addPrimaryKey(([EncryptionMetaSchema.properties.EncryptionMetaId]: Array<string>), false);

  // KeyDerivation Table
  schemaBuilder
    .createTable(KeyDerivationSchema.name)
    .addColumn(KeyDerivationSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.PrivateKeyId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.PublicKeyId, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.Parent, Type.INTEGER)
    .addColumn(KeyDerivationSchema.properties.Index, Type.INTEGER)
    .addPrimaryKey(([KeyDerivationSchema.properties.KeyDerivationId]: Array<string>), true)
    .addForeignKey('KeyDerivation_Parent', {
      local: KeyDerivationSchema.properties.Parent,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`,
      // cascade doesn't work for many-to-many so we instead use deferrable and delete manually
      timing: ConstraintTiming.DEFERRABLE,
    })
    .addForeignKey('KeyDerivation_PrivateKeyId', {
      local: KeyDerivationSchema.properties.PrivateKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`,
    })
    .addForeignKey('KeyDerivation_PublicKeyId', {
      local: KeyDerivationSchema.properties.PublicKeyId,
      ref: `${KeySchema.name}.${KeySchema.properties.KeyId}`,
    })
    .addNullable([
      KeyDerivationSchema.properties.PrivateKeyId,
      KeyDerivationSchema.properties.PublicKeyId,
      KeyDerivationSchema.properties.Parent,
      KeyDerivationSchema.properties.Index,
    ]);

  schemaBuilder
    .createTable(BlockSchema.name)
    .addColumn(BlockSchema.properties.BlockId, Type.INTEGER)
    .addColumn(BlockSchema.properties.SlotNum, Type.INTEGER)
    .addColumn(BlockSchema.properties.Height, Type.INTEGER)
    .addColumn(BlockSchema.properties.Digest, Type.NUMBER)
    .addColumn(BlockSchema.properties.Hash, Type.STRING)
    .addColumn(BlockSchema.properties.BlockTime, Type.DATE_TIME)
    .addPrimaryKey(([BlockSchema.properties.BlockId]: Array<string>), true)
    .addIndex(
      'Block_Digest_Index',
      ([BlockSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    )
    .addIndex('Block_Height_Index', ([BlockSchema.properties.Height]: Array<string>), false);

  // Transaction table
  schemaBuilder
    .createTable(TransactionSchema.name)
    .addColumn(TransactionSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Type, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Digest, Type.NUMBER)
    .addColumn(TransactionSchema.properties.Hash, Type.STRING)
    .addColumn(TransactionSchema.properties.BlockId, Type.INTEGER)
    .addColumn(TransactionSchema.properties.Ordinal, Type.INTEGER)
    .addColumn(TransactionSchema.properties.LastUpdateTime, Type.NUMBER)
    .addColumn(TransactionSchema.properties.Status, Type.INTEGER)
    .addColumn(TransactionSchema.properties.ErrorMessage, Type.STRING)
    .addColumn(TransactionSchema.properties.Extra, Type.OBJECT)
    .addPrimaryKey(([TransactionSchema.properties.TransactionId]: Array<string>), true)
    .addForeignKey('Transaction_Block', {
      local: TransactionSchema.properties.BlockId,
      ref: `${BlockSchema.name}.${BlockSchema.properties.BlockId}`,
    })
    .addNullable([
      TransactionSchema.properties.BlockId,
      TransactionSchema.properties.Ordinal,
      TransactionSchema.properties.ErrorMessage,
      TransactionSchema.properties.Extra,
    ])
    .addIndex(
      'Transaction_Digest_Index',
      ([TransactionSchema.properties.Digest]: Array<string>),
      false // not unique. There is a (very small) chance of collisions
    );
  // CanonicalAddress
  schemaBuilder
    .createTable(CanonicalAddressSchema.name)
    .addColumn(CanonicalAddressSchema.properties.CanonicalAddressId, Type.INTEGER)
    .addColumn(CanonicalAddressSchema.properties.KeyDerivationId, Type.INTEGER)
    .addPrimaryKey(([CanonicalAddressSchema.properties.CanonicalAddressId]: Array<string>), true)
    .addForeignKey('CanonicalAddress_KeyDerivation', {
      local: CanonicalAddressSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`,
      action: ConstraintAction.CASCADE,
    })
    .addIndex('CanonicalAddress_KeyDerivation_Index', ([CanonicalAddressSchema.properties.KeyDerivationId]: Array<string>), true);
  // AddressMapping
  schemaBuilder
    .createTable(AddressMappingSchema.name)
    .addColumn(AddressMappingSchema.properties.AddressMappingId, Type.INTEGER)
    .addColumn(AddressMappingSchema.properties.KeyDerivationId, Type.INTEGER)
    .addColumn(AddressMappingSchema.properties.AddressId, Type.INTEGER)
    .addPrimaryKey(([AddressMappingSchema.properties.AddressMappingId]: Array<string>), true)
    .addForeignKey('AddressMapping_KeyDerivation', {
      local: AddressMappingSchema.properties.KeyDerivationId,
      ref: `${KeyDerivationSchema.name}.${KeyDerivationSchema.properties.KeyDerivationId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('AddressMapping_Address', {
      local: AddressMappingSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`,
      action: ConstraintAction.CASCADE,
    })
    .addIndex('AddressMapping_KeyDerivation_Index', ([AddressMappingSchema.properties.KeyDerivationId]: Array<string>), false);

  // Certificate Table
  schemaBuilder
    .createTable(CertificateSchema.name)
    .addColumn(CertificateSchema.properties.CertificateId, Type.INTEGER)
    .addColumn(CertificateSchema.properties.TransactionId, Type.INTEGER)
    .addColumn(CertificateSchema.properties.Ordinal, Type.INTEGER)
    .addColumn(CertificateSchema.properties.Kind, Type.INTEGER)
    .addColumn(CertificateSchema.properties.Payload, Type.STRING)
    .addPrimaryKey(([CertificateSchema.properties.CertificateId]: Array<string>), true)
    .addForeignKey('Certificate_Transaction', {
      local: CertificateSchema.properties.TransactionId,
      ref: `${TransactionSchema.name}.${TransactionSchema.properties.TransactionId}`,
      action: ConstraintAction.CASCADE,
    })
    .addIndex(
      'Certificate_Transaction_Index',
      ([CertificateSchema.properties.TransactionId]: Array<string>),
      false // haskell shelley allows multiple certificates per transaction
    );

  // CertificateAddress Table
  schemaBuilder
    .createTable(CertificateAddressSchema.name)
    .addColumn(CertificateAddressSchema.properties.CertificateAddressId, Type.INTEGER)
    .addColumn(CertificateAddressSchema.properties.CertificateId, Type.INTEGER)
    .addColumn(CertificateAddressSchema.properties.AddressId, Type.INTEGER)
    .addColumn(CertificateAddressSchema.properties.Relation, Type.INTEGER)
    .addPrimaryKey(([CertificateAddressSchema.properties.CertificateAddressId]: Array<string>), true)
    .addForeignKey('CertificateAddress_Certificate', {
      local: CertificateAddressSchema.properties.CertificateId,
      ref: `${CertificateSchema.name}.${CertificateSchema.properties.CertificateId}`,
      action: ConstraintAction.CASCADE,
    })
    .addForeignKey('CertificateAddress_Address', {
      local: CertificateAddressSchema.properties.AddressId,
      ref: `${AddressSchema.name}.${AddressSchema.properties.AddressId}`,
    })
    .addIndex('CertificateAddress_Certificate_Index', ([CertificateAddressSchema.properties.CertificateId]: Array<string>), false)
    .addIndex('Address_Transaction_Index', ([CertificateAddressSchema.properties.AddressId]: Array<string>), false);

  // Token Table
  schemaBuilder
    .createTable(TokenSchema.name)
    .addColumn(TokenSchema.properties.TokenId, Type.INTEGER)
    .addColumn(TokenSchema.properties.NetworkId, Type.INTEGER)
    .addColumn(TokenSchema.properties.IsDefault, Type.BOOLEAN)
    .addColumn('IsNFT', Type.BOOLEAN)
    .addColumn(TokenSchema.properties.Identifier, Type.STRING)
    .addColumn(TokenSchema.properties.Digest, Type.NUMBER)
    .addColumn(TokenSchema.properties.Metadata, Type.OBJECT)
    .addPrimaryKey(([TokenSchema.properties.TokenId]: Array<string>), true)
    .addForeignKey('Token_Network', {
      local: TokenSchema.properties.NetworkId,
      ref: `${NetworkSchema.name}.${NetworkSchema.properties.NetworkId}`,
      action: ConstraintAction.CASCADE,
    })
    .addIndex(
      'Token_Digest',
      ([TokenSchema.properties.Digest]: Array<string>),
      /**
       * not unique since different networks can have the same token
       * easiest to achieve by using a testnet for the same blockchain
       */
      false
    );

  // TokenList Table
  schemaBuilder
    .createTable(TokenListSchema.name)
    .addColumn(TokenListSchema.properties.TokenListItemId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.ListId, Type.INTEGER)
    .addColumn(TokenListSchema.properties.TokenId, Type.INTEGER)

    .addColumn(TokenListSchema.properties.Amount, Type.STRING)
    .addPrimaryKey(([TokenListSchema.properties.TokenListItemId]: Array<string>), true)
    .addForeignKey('TokenList_Token', {
      local: TokenListSchema.properties.TokenId,
      ref: `${TokenSchema.name}.${TokenSchema.properties.TokenId}`,
    })
    .addIndex(
      'TokenList_ListId',
      ([TokenListSchema.properties.ListId]: Array<string>),
      false // one list can contain multiple assets
    );
};
