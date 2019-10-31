// @flow

import {
  RootDerivationSchema,
  PurposeDerivationSchema,
  CoinTypeDerivationSchema,
  Bip44AccountSchema,
  Bip44ChainSchema,
} from '../../common/tables';

export const Cip1852DerivationLevels = Object.freeze({
  ROOT: {
    level: 0,
    table: RootDerivationSchema,
  },
  PURPOSE: {
    level: 1,
    table: PurposeDerivationSchema,
  },
  COIN_TYPE: {
    level: 2,
    table: CoinTypeDerivationSchema,
  },
  ACCOUNT: {
    level: 3,
    table: Bip44AccountSchema,
  },
  // TODO: add Account level somehow
  CHAIN: {
    level: 4,
    table: Bip44ChainSchema,
  },
  // TODO: add Address level
});
const Cip1852TableMap = new Map<number, string>(
  Object.keys(Cip1852DerivationLevels)
    .map(key => Cip1852DerivationLevels[key])
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
const allCip1852DerivationTables = {
  [RootDerivationSchema.name]: RootDerivationSchema,
  [PurposeDerivationSchema.name]: PurposeDerivationSchema,
  [CoinTypeDerivationSchema.name]: CoinTypeDerivationSchema,
  [Bip44AccountSchema.name]: Bip44AccountSchema,
  [Bip44ChainSchema.name]: Bip44ChainSchema,
  // TODO: add missing tables
};

export class GetCip1852Tables {
  static ownTables = Object.freeze({
    ...allCip1852DerivationTables,
  });
  static depTables = Object.freeze({});

  static get(
  ): Map<number, string> {
    return Cip1852TableMap;
  }
}
