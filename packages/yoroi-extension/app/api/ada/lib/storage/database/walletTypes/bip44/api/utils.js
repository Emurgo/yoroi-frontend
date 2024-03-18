// @flow

import {
  RootDerivationSchema,
  PurposeDerivationSchema,
  CoinTypeDerivationSchema,
  Bip44AccountSchema,
  Bip44ChainSchema,
} from '../../common/tables';
import {
  CanonicalAddressSchema, AddressMappingSchema, AddressSchema, EncryptionMetaSchema,
} from '../../../primitives/tables';
import type { CanonicalAddressInsert, } from '../../../primitives/tables';
import type { TreeInsert, InsertRequest, } from '../../common/utils.types';
import type { Schema } from '../../../utils';

export const Bip44DerivationLevels = Object.freeze({
  ROOT: {
    level: 0,
    table: RootDerivationSchema,
    extra: ([]: Array<Schema>),
  },
  PURPOSE: {
    level: 1,
    table: PurposeDerivationSchema,
    extra: ([]: Array<Schema>),
  },
  COIN_TYPE: {
    level: 2,
    table: CoinTypeDerivationSchema,
    extra: ([]: Array<Schema>),
  },
  ACCOUNT: {
    level: 3,
    table: Bip44AccountSchema,
    extra: ([]: Array<Schema>),
  },
  CHAIN: {
    level: 4,
    table: Bip44ChainSchema,
    extra: ([]: Array<Schema>),
  },
  ADDRESS: {
    level: 5,
    table: CanonicalAddressSchema,
    extra: [AddressMappingSchema, AddressSchema, EncryptionMetaSchema],
  },
});

/**
 * We sometimes need to lock all level-specific derivation tables
 * This is because we need to statically know which tables will be accessed by a query
 * However, it may not always be possible to know which derivation level will be required
 *
 * For example, it's possible a transaction includes a query that fetches which level is needed
 * follow by a query at that level.
 * Since we cannot statically determine which level will be used, we just lock all tables.
 */
export const Bip44TableMap: Map<number, string> = new Map<number, string>(
  [
    ...Object.keys(Bip44DerivationLevels)
      .map(key => Bip44DerivationLevels[key])
      .map(val => [val.level, val.table.name]),
    // TODO: we need to attach some extra tables to make sure we lock them
    // this is a hack to lock them by setting them to a high level that shouldn't be reasonably used
    ...Object.keys(Bip44DerivationLevels)
      .map(key => Bip44DerivationLevels[key])
      .flatMap(val => val.extra)
      .map((val, i) => [1000 + i, val.name]),
  ]
);

// TODO: move to more generic file
export function flattenInsertTree(
  tree: TreeInsert<any>,
): Array<{|
  path: Array<number>,
  insert: InsertRequest => Promise<CanonicalAddressInsert>,
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
