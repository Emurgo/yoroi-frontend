// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Bip44DerivationMappingRow,
  Bip44DerivationRow,
  Bip44WrapperRow,
  PublicDeriverRow,
} from '../tables';
import * as Bip44Tables from '../tables';

import {
  TableMap,
} from './utils';
import { getRowIn, getRowFromKey } from '../../utils';

export class GetDerivation {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44RootSchema.name]: Bip44Tables.Bip44RootSchema,
    [Bip44Tables.Bip44PurposeSchema.name]: Bip44Tables.Bip44PurposeSchema,
    [Bip44Tables.Bip44CoinTypeSchema.name]: Bip44Tables.Bip44CoinTypeSchema,
    [Bip44Tables.Bip44AccountSchema.name]: Bip44Tables.Bip44AccountSchema,
    [Bip44Tables.Bip44ChainSchema.name]: Bip44Tables.Bip44ChainSchema,
    [Bip44Tables.Bip44AddressSchema.name]: Bip44Tables.Bip44AddressSchema,
    [Bip44Tables.Bip44DerivationSchema.name]: Bip44Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async func<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    derivationIds: Array<number>,
    level: number,
  ): Promise<Array<Row>> {
    const tableName = TableMap.get(level);
    if (tableName == null) {
      throw new Error('AddDerivation::func Unknown table queried');
    }
    return await getRowIn<Row>(
      db, tx,
      tableName,
      Bip44Tables.Bip44DerivationSchema.properties.Bip44DerivationId,
      derivationIds,
    );
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
    [Bip44Tables.Bip44DerivationMappingSchema.name]: (
      Bip44Tables.Bip44DerivationMappingSchema
    ),
    [Bip44Tables.Bip44DerivationSchema.name]: Bip44Tables.Bip44DerivationSchema,
  });
  static depTables = Object.freeze({});

  static async func(
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

  const mappingTable = db.getSchema().table(
    GetDerivationsByPath.ownTables[Bip44Tables.Bip44DerivationMappingSchema.name].name
  );
  const derivationTable = db.getSchema().table(
    GetDerivationsByPath.ownTables[Bip44Tables.Bip44DerivationSchema.name].name
  );
  const conditions = [
    mappingTable[Bip44Tables.Bip44DerivationMappingSchema.properties.Parent].in(
      Array.from(pathMap.keys())
    ),
  ];
  // if the query is for a specific index, we need to add the condition to the SQL query
  if (queryPath[currPathIndex] !== null) {
    conditions.push(
      derivationTable[Bip44Tables.Bip44DerivationSchema.properties.Index].eq(
        queryPath[currPathIndex]
      ),
    );
  }

  const query = db
    .select()
    .from(mappingTable)
    .innerJoin(
      derivationTable,
      derivationTable[Bip44Tables.Bip44DerivationSchema.properties.Bip44DerivationId]
        .eq(mappingTable[Bip44Tables.Bip44DerivationMappingSchema.properties.Child]),
    )
    .where(...conditions);

  const queryResult: Array<{
    Bip44DerivationMapping: Bip44DerivationMappingRow,
    Bip44Derivation: Bip44DerivationRow,
  }> = await tx.attach(query);
  const nextPathMap = new Map(queryResult.map(row => {
    const path = pathMap.get(row.Bip44DerivationMapping.Parent);
    if (!path) throw new Error('genericBip44::_getDerivationsByPath Should never happen');
    if (row.Bip44Derivation.Index === null) throw new Error('genericBip44::_getDerivationsByPath null child index');
    return [
      row.Bip44DerivationMapping.Child,
      path.concat([row.Bip44Derivation.Index])
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
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<PublicDeriverRow | void> {
    return await getRowFromKey<PublicDeriverRow>(
      db, tx,
      key,
      GetPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name,
      Bip44Tables.PublicDeriverSchema.properties.PublicDeriverId,
    );
  }
}

export class GetBip44Wrapper {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44WrapperSchema.name]: Bip44Tables.Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<Bip44WrapperRow | void> {
    return await getRowFromKey<Bip44WrapperRow>(
      db, tx,
      key,
      GetBip44Wrapper.ownTables[Bip44Tables.Bip44WrapperSchema.name].name,
      Bip44Tables.Bip44WrapperSchema.properties.Bip44WrapperId,
    );
  }
}
