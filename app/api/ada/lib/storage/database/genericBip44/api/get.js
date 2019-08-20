// @flow

import type {
  lf$Database,
  lf$Transaction,
  lf$Predicate,
} from 'lovefield';
import { op } from 'lovefield';

import type {
  Bip44DerivationRow,
  Bip44WrapperRow,
  PublicDeriverRow,
  PrivateDeriverRow,
} from '../tables';
import * as Tables from '../tables';

import {
  TableMap,
} from './utils';
import { getRowIn, getRowFromKey } from '../../utils';

export class GetDerivation {
  static ownTables = Object.freeze({
    [Tables.Bip44RootSchema.name]: Tables.Bip44RootSchema,
    [Tables.Bip44PurposeSchema.name]: Tables.Bip44PurposeSchema,
    [Tables.Bip44CoinTypeSchema.name]: Tables.Bip44CoinTypeSchema,
    [Tables.Bip44AccountSchema.name]: Tables.Bip44AccountSchema,
    [Tables.Bip44ChainSchema.name]: Tables.Bip44ChainSchema,
    [Tables.Bip44AddressSchema.name]: Tables.Bip44AddressSchema,
    [Tables.Bip44DerivationSchema.name]: Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    derivationIds: Array<number>,
    level: number,
  ): Promise<Array<Row>> {
    const tableName = TableMap.get(level);
    if (tableName == null) {
      throw new Error('AddDerivation::get Unknown table queried');
    }
    return await getRowIn<Row>(
      db, tx,
      tableName,
      GetDerivation.ownTables[Tables.Bip44DerivationSchema.name].properties.Bip44DerivationId,
      derivationIds,
    );
  }
}

export class GetChildIfExists {
  static ownTables = Object.freeze({
    [Tables.Bip44DerivationSchema.name]: Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    parentId: number,
    childIndex: number,
  ): Promise<void | Bip44DerivationRow> {
    const derivationSchema = GetChildIfExists.ownTables[Tables.Bip44DerivationSchema.name];

    const derivationTable = db.getSchema().table(derivationSchema.name);
    const conditions: Array<lf$Predicate> = [
      derivationTable[derivationSchema.properties.Index].eq(childIndex),
      derivationTable[derivationSchema.properties.Parent].eq(parentId),
    ];

    const query = db
      .select()
      .from(derivationTable)
      .where(op.and(...conditions));

    const queryResult: Array<Bip44DerivationRow> = await tx.attach(query);

    return queryResult.length === 1
      ? queryResult[0]
      : undefined;
  }
}

/**
 * A specific number means you only care about the specific index
 * Null indicates querying all derivations at the level
 */
export type BIP32QueryPath = Array<number | null>;
type PathMapType = Map<number, Array<number>>;

export class GetDerivationsByPath {
  static ownTables = Object.freeze({
    [Tables.Bip44DerivationSchema.name]: Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    derivationId: number,
    commonPrefix: Array<number>,
    queryPath: BIP32QueryPath,
  ): Promise<PathMapType> {
    const pathMap = new Map([[derivationId, commonPrefix]]);
    const result = await _getDerivationsByPath(
      db,
      tx,
      pathMap,
      commonPrefix.concat(queryPath),
      commonPrefix.length,
    );
    return result;
  }
}
const _getDerivationsByPath = async (
  db: lf$Database,
  tx: lf$Transaction,
  pathMap: PathMapType,
  queryPath: BIP32QueryPath,
  currPathIndex: number,
): Promise<PathMapType> => {
  // base case
  if (currPathIndex === queryPath.length) {
    return pathMap;
  }
  const derivationSchema = GetDerivationsByPath.ownTables[Tables.Bip44DerivationSchema.name];

  const derivationTable = db.getSchema().table(derivationSchema.name);
  const conditions = [
    derivationTable[derivationSchema.properties.Parent].in(
      Array.from(pathMap.keys())
    ),
  ];
  // if the query is for a specific index, we need to add the condition to the SQL query
  if (queryPath[currPathIndex] !== null) {
    conditions.push(
      derivationTable[derivationSchema.properties.Index].eq(
        queryPath[currPathIndex]
      ),
    );
  }

  const query = db
    .select()
    .from(derivationTable)
    .where(op.and(...conditions));

  const queryResult: Array<Bip44DerivationRow> = await tx.attach(query);
  const nextPathMap = new Map(queryResult.map(row => {
    if (row.Parent == null) throw new Error('genericBip44::_getDerivationsByPath Should never happen');
    const path = pathMap.get(row.Parent);
    if (path == null) throw new Error('genericBip44::_getDerivationsByPath Should never happen');
    if (row.Index === null) throw new Error('genericBip44::_getDerivationsByPath null child index');
    return [
      row.Bip44DerivationId,
      path.concat([row.Index])
    ];
  }));
  if (nextPathMap.size === 0) {
    throw new Error('genericBip44::_getDerivationsByPath no result');
  }

  const result = _getDerivationsByPath(
    db,
    tx,
    nextPathMap,
    queryPath,
    currPathIndex + 1,
  );
  return result;
};

export class GetPublicDeriver {
  static ownTables = Object.freeze({
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<PublicDeriverRow | void> {
    return await getRowFromKey<PublicDeriverRow>(
      db, tx,
      key,
      GetPublicDeriver.ownTables[Tables.PublicDeriverSchema.name].name,
      GetPublicDeriver.ownTables[Tables.PublicDeriverSchema.name].properties.PublicDeriverId,
    );
  }
}

export class GetPrivateDeriver {
  static ownTables = Object.freeze({
    [Tables.PrivateDeriverSchema.name]: Tables.PrivateDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async fromBip44Wrapper(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<PrivateDeriverRow | void> {
    return await getRowFromKey<PrivateDeriverRow>(
      db, tx,
      key,
      GetPrivateDeriver.ownTables[Tables.PrivateDeriverSchema.name].name,
      GetPrivateDeriver.ownTables[Tables.PrivateDeriverSchema.name].properties.Bip44WrapperId,
    );
  }
}

export class GetBip44Wrapper {
  static ownTables = Object.freeze({
    [Tables.Bip44WrapperSchema.name]: Tables.Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<Bip44WrapperRow | void> {
    return await getRowFromKey<Bip44WrapperRow>(
      db, tx,
      key,
      GetBip44Wrapper.ownTables[Tables.Bip44WrapperSchema.name].name,
      GetBip44Wrapper.ownTables[Tables.Bip44WrapperSchema.name].properties.Bip44WrapperId,
    );
  }
}

export class GetBip44Derivation {
  static ownTables = Object.freeze({
    [Tables.Bip44DerivationSchema.name]: Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<Bip44DerivationRow | void> {
    return await getRowFromKey<Bip44DerivationRow>(
      db, tx,
      key,
      GetBip44Derivation.ownTables[Tables.Bip44DerivationSchema.name].name,
      GetBip44Derivation.ownTables[Tables.Bip44DerivationSchema.name].properties.Bip44DerivationId,
    );
  }
}
