// @flow

import {
  Bip44RootSchema,
  Bip44PurposeSchema,
  Bip44CoinTypeSchema,
  Bip44AccountSchema,
  Bip44ChainSchema,
  Bip44AddressSchema,
} from '../../common/tables';
import type { Bip44AddressInsert, } from '../../common/tables';
import type { TreeInsert, } from './write';

export const Bip44DerivationLevels = Object.freeze({
  ROOT: {
    level: 0,
    table: Bip44RootSchema,
  },
  PURPOSE: {
    level: 1,
    table: Bip44PurposeSchema,
  },
  COIN_TYPE: {
    level: 2,
    table: Bip44CoinTypeSchema,
  },
  ACCOUNT: {
    level: 3,
    table: Bip44AccountSchema,
  },
  CHAIN: {
    level: 4,
    table: Bip44ChainSchema,
  },
  ADDRESS: {
    level: 5,
    table: Bip44AddressSchema,
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
  [Bip44RootSchema.name]: Bip44RootSchema,
  [Bip44PurposeSchema.name]: Bip44PurposeSchema,
  [Bip44CoinTypeSchema.name]: Bip44CoinTypeSchema,
  [Bip44AccountSchema.name]: Bip44AccountSchema,
  [Bip44ChainSchema.name]: Bip44ChainSchema,
  [Bip44AddressSchema.name]: Bip44AddressSchema,
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
