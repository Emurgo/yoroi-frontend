// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  OwnTableType,
  DepTableType,
  TableClassType
} from '../wrapper';

import type {
  Bip44DerivationMappingInsert, Bip44DerivationMappingRow,
  Bip44DerivationInsert,
  Bip44DerivationRow,
  Bip44RootInsert, Bip44RootRow,
  Bip44PurposeInsert, Bip44PurposeRow,
  Bip44CoinTypeInsert, Bip44CoinTypeRow,
  Bip44AccountInsert, Bip44AccountRow,
  Bip44ChainInsert, Bip44ChainRow,
  Bip44AddressInsert, Bip44AddressRow,
  PrivateDeriverInsert, PrivateDeriverRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperInsert, Bip44WrapperRow,
} from './tables';
import * as Bip44Tables from './tables';
import { KeySchema, } from '../uncategorized/tables';

import type { KeyInsert, KeyRow } from '../uncategorized/tables';

import { addToTable, getRowIn, getRowFromKey } from '../utils';

export type AddDerivationRequest<Insert> = {|
  privateKeyInfo: KeyInsert | null,
  publicKeyInfo: KeyInsert | null,
  derivationInfo: {|
      private: number | null,
      public: number | null,
    |} => Bip44DerivationInsert,
  levelInfo: number => Insert,
|};

export class AddDerivation {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44RootSchema.name]: (Bip44Tables.Bip44RootSchema.name: string),
    [Bip44Tables.Bip44PurposeSchema.name]: (Bip44Tables.Bip44PurposeSchema.name: string),
    [Bip44Tables.Bip44CoinTypeSchema.name]: (Bip44Tables.Bip44CoinTypeSchema.name: string),
    [Bip44Tables.Bip44AccountSchema.name]: (Bip44Tables.Bip44AccountSchema.name: string),
    [Bip44Tables.Bip44ChainSchema.name]: (Bip44Tables.Bip44ChainSchema.name: string),
    [Bip44Tables.Bip44AddressSchema.name]: (Bip44Tables.Bip44AddressSchema.name: string),
    [Bip44Tables.Bip44DerivationSchema.name]: (Bip44Tables.Bip44DerivationSchema.name: string),
    [KeySchema.name]: (KeySchema.name: string),
  });
  static depTables = {};

  static func = async function<Insert, Row> (
    db: lf$Database,
    tx: lf$Transaction,
    request: AddDerivationRequest<Insert>,
    tableName: string,
  ): Promise<{
    derivationTableResult: Bip44DerivationRow,
    specificDerivationResult: Row,
  }> {
    const privateKey = request.privateKeyInfo === null
      ? null
      : await addToTable<KeyInsert, KeyRow>(
        db, tx,
        request.privateKeyInfo, AddDerivation.ownTables[KeySchema.name]
      );
    const publicKey = request.publicKeyInfo === null
      ? null
      : await await addToTable<KeyInsert, KeyRow>(
        db, tx,
        request.publicKeyInfo, AddDerivation.ownTables[KeySchema.name]
      );

    const derivationTableResult =
      await addToTable<Bip44DerivationInsert, Bip44DerivationRow>(
        db, tx,
        request.derivationInfo({
          private: privateKey ? privateKey.KeyId : null,
          public: publicKey ? publicKey.KeyId : null,
        }),
        AddDerivation.ownTables[Bip44Tables.Bip44DerivationSchema.name],
      );

    const specificDerivationResult =
      await addToTable<Insert, Row>(
        db,
        tx,
        request.levelInfo(derivationTableResult.Bip44DerivationId),
        tableName,
      );

    return {
      derivationTableResult,
      specificDerivationResult,
    };
  }
}

export const DerivationLevels = Object.freeze({
  ROOT: {
    level: 0,
    table: Bip44Tables.Bip44RootSchema,
  },
  PURPOSE: {
    level: 1,
    table: Bip44Tables.Bip44PurposeSchema,
  },
  COIN_TYPE: {
    level: 2,
    table: Bip44Tables.Bip44CoinTypeSchema,
  },
  ACCOUNT: {
    level: 3,
    table: Bip44Tables.Bip44AccountSchema,
  },
  CHAIN: {
    level: 4,
    table: Bip44Tables.Bip44ChainSchema,
  },
  ADDRESS: {
    level: 5,
    table: Bip44Tables.Bip44AddressSchema,
  },
});
export const TableMap = new Map<number, string>(
  Object.keys(DerivationLevels)
    .map(key => DerivationLevels[key])
    .map(val => [val.level, val.table.name])
);

/**
 * We sometimes need to lock all level-specific derivation tables
 * This is because we need to statically know which tables will be accessed by a query
 * However, it may not always be possible to know which derivation level will be required
 *
 * For example, it's possible a transaction includes a query that fetches which level is needed
 * follow by a query at that level.
 * Since we cannot statically determine which level will be used, we just lock all tables.
 */
export const allDerivationTables = {
  [Bip44Tables.Bip44RootSchema.name]: Bip44Tables.Bip44RootSchema.name,
  [Bip44Tables.Bip44PurposeSchema.name]: Bip44Tables.Bip44PurposeSchema.name,
  [Bip44Tables.Bip44CoinTypeSchema.name]: Bip44Tables.Bip44CoinTypeSchema.name,
  [Bip44Tables.Bip44AccountSchema.name]: Bip44Tables.Bip44AccountSchema.name,
  [Bip44Tables.Bip44ChainSchema.name]: Bip44Tables.Bip44ChainSchema.name,
  [Bip44Tables.Bip44AddressSchema.name]: Bip44Tables.Bip44AddressSchema.name,
};
