// @flow

import * as Bip44Tables from '../tables';

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
  [Bip44Tables.Bip44RootSchema.name]: Bip44Tables.Bip44RootSchema,
  [Bip44Tables.Bip44PurposeSchema.name]: Bip44Tables.Bip44PurposeSchema,
  [Bip44Tables.Bip44CoinTypeSchema.name]: Bip44Tables.Bip44CoinTypeSchema,
  [Bip44Tables.Bip44AccountSchema.name]: Bip44Tables.Bip44AccountSchema,
  [Bip44Tables.Bip44ChainSchema.name]: Bip44Tables.Bip44ChainSchema,
  [Bip44Tables.Bip44AddressSchema.name]: Bip44Tables.Bip44AddressSchema,
};
