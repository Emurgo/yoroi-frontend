// @flow

import * as Bip44Tables from '../tables';
import type { Bip44AddressInsert, } from '../tables';
import type { TreeInsert, } from './write';

export const Bip44DerivationLevels = Object.freeze({
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
export const Bip44TableMap = new Map<number, string>(
  Object.keys(Bip44DerivationLevels)
    .map(key => Bip44DerivationLevels[key])
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
export const allBip44DerivationTables = {
  [Bip44Tables.Bip44RootSchema.name]: Bip44Tables.Bip44RootSchema,
  [Bip44Tables.Bip44PurposeSchema.name]: Bip44Tables.Bip44PurposeSchema,
  [Bip44Tables.Bip44CoinTypeSchema.name]: Bip44Tables.Bip44CoinTypeSchema,
  [Bip44Tables.Bip44AccountSchema.name]: Bip44Tables.Bip44AccountSchema,
  [Bip44Tables.Bip44ChainSchema.name]: Bip44Tables.Bip44ChainSchema,
  [Bip44Tables.Bip44AddressSchema.name]: Bip44Tables.Bip44AddressSchema,
};

export function flattenInsertTree(
  tree: TreeInsert<any>,
): Array<{|
  path: Array<number>,
  insert: Bip44AddressInsert,
|}> {
  const addresses = [];
  for (const branch of tree) {
    if (branch.children != null) {
      const children = flattenInsertTree(branch.children);
      for (const child of children) {
        addresses.push({
          path: [branch.index].concat(child.path),
          insert: child.insert
        });
      }
    } else {
      addresses.push({
        path: [branch.index],
        insert: branch.insert
      });
    }
  }
  return addresses;
}
