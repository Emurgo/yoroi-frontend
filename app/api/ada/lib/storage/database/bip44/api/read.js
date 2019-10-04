// @flow

import type {
  lf$Database,
  lf$Transaction,
  lf$Predicate,
} from 'lovefield';
import { op } from 'lovefield';

import type {
  Bip44WrapperRow,
  PublicDeriverRow,
  PrivateDeriverRow,
} from '../tables';
import * as Tables from '../tables';

import {
  TableMap,
  DerivationLevels,
} from './utils';
import {
  getRowIn,
  getRowFromKey,
  StaleStateError,
} from '../../utils';

import {
  GetKey,
} from '../../uncategorized/api/read';
import type {
  KeyRow,
  KeyDerivationRow,
} from '../../uncategorized/tables';
import {
  KeyDerivationSchema,
} from '../../uncategorized/tables';
import {
  ReadLastSyncInfo,
} from '../../wallet/api/read';
import type { LastSyncInfoRow, } from '../../wallet/tables';

export class GetDerivationSpecific {
  static ownTables = Object.freeze({
    [Tables.Bip44RootSchema.name]: Tables.Bip44RootSchema,
    [Tables.Bip44PurposeSchema.name]: Tables.Bip44PurposeSchema,
    [Tables.Bip44CoinTypeSchema.name]: Tables.Bip44CoinTypeSchema,
    [Tables.Bip44AccountSchema.name]: Tables.Bip44AccountSchema,
    [Tables.Bip44ChainSchema.name]: Tables.Bip44ChainSchema,
    [Tables.Bip44AddressSchema.name]: Tables.Bip44AddressSchema,
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    derivationIds: Array<number>,
    level: number,
  ): Promise<$ReadOnlyArray<$ReadOnly<Row>>> {
    const tableName = TableMap.get(level);
    if (tableName == null) {
      throw new Error('AddDerivation::get Unknown table queried');
    }
    return await getRowIn<Row>(
      db, tx,
      tableName,
      GetDerivationSpecific.ownTables[KeyDerivationSchema.name].properties.KeyDerivationId,
      derivationIds,
    );
  }
}

export class GetChildIfExists {
  static ownTables = Object.freeze({
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    parentId: number,
    childIndex: number,
  ): Promise<void | $ReadOnly<KeyDerivationRow>> {
    const derivationSchema = GetChildIfExists.ownTables[KeyDerivationSchema.name];

    const derivationTable = db.getSchema().table(derivationSchema.name);
    const conditions: Array<lf$Predicate> = [
      derivationTable[derivationSchema.properties.Index].eq(childIndex),
      derivationTable[derivationSchema.properties.Parent].eq(parentId),
    ];

    const query = db
      .select()
      .from(derivationTable)
      .where(op.and(...conditions));

    const queryResult: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>> = await tx.attach(query);

    return queryResult.length === 1
      ? queryResult[0]
      : undefined;
  }
}

export class GetChildWithSpecific {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetChildIfExists,
    GetDerivationSpecific
  });

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    level: number,
    parentId: number,
    childIndex: number,
  ): Promise<void | {
    derivation:  $ReadOnly<KeyDerivationRow>,
    levelSpecific: $ReadOnly<Row>,
  }> {
    const derivation = await GetChildWithSpecific.depTables.GetChildIfExists.get(
      db, tx,
      parentId,
      childIndex,
    );
    if (derivation === undefined) {
      return undefined;
    }

    const levelSpecific = await GetPathWithSpecific.depTables.GetDerivationSpecific.get<Row>(
      db, tx,
      [derivation.KeyDerivationId],
      level,
    );
    if (levelSpecific.length === 0) {
      // we know this level exists since we fetched it in GetChildIfExists
      throw new Error('GetChildWithSpecific::get should never happen');
    }
    return {
      derivation,
      levelSpecific: levelSpecific[0],
    };
  }
}

export class GetKeyDerivation {
  static ownTables = Object.freeze({
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<KeyDerivationRow> | void> {
    return await getRowFromKey<KeyDerivationRow>(
      db, tx,
      key,
      GetKeyDerivation.ownTables[KeyDerivationSchema.name].name,
      GetKeyDerivation.ownTables[KeyDerivationSchema.name].properties.KeyDerivationId,
    );
  }
}

/**
 * A specific number means you only care about the specific index
 * Null indicates querying all derivations at the level
 */
export type BIP32QueryPath = $ReadOnlyArray<number | null>;
/**
 * Mapping from KeyDerivationId to addressing info
 */
type PathMapType = Map<number, Array<number>>;

export class GetDerivationsByPath {
  static ownTables = Object.freeze({
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetChildIfExists,
    GetKeyDerivation,
  });

  /**
   * Note: last element in return type is startingKey
   */
  static async getParentPath(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      startingKey: $ReadOnly<KeyDerivationRow>,
      numLevels: number,
    },
  ): Promise<Array<$ReadOnly<KeyDerivationRow>>> {
    const path = [request.startingKey];
    for (let i = 0; i < request.numLevels; i++) {
      const parentId = path[path.length - 1].Parent;
      if (parentId === null) {
        throw new Error('GetDerivationsByPath::getParentPath unexpected end');
      }
      const parent = await GetDerivationsByPath.depTables.GetKeyDerivation.get(
        db, tx,
        parentId
      );
      if (parent === undefined) {
        throw new Error('GetDerivationsByPath::getParentPath parent not found');
      }
      path.push(parent);
    }

    return path.reverse();
  }

  static async getSinglePath(
    db: lf$Database,
    tx: lf$Transaction,
    startingDerivationId: number,
    queryPath: Array<number>,
  ): Promise<Array<$ReadOnly<KeyDerivationRow>>> {
    if (queryPath.length === 0) {
      throw new Error('GetDerivationsByPath::getSinglePath empty path');
    }

    let currDerivationId = startingDerivationId;
    const derivations = [];
    for (const index of queryPath) {
      const nextDerivation = await GetDerivationsByPath.depTables.GetChildIfExists.get(
        db, tx,
        currDerivationId,
        queryPath[index],
      );
      if (nextDerivation === undefined) {
        throw new Error('GetDerivationsByPath::getSinglePath no path from' + currDerivationId + ' to ' + index);
      }
      derivations.push(nextDerivation);
      currDerivationId = nextDerivation.KeyDerivationId;
    }

    return derivations;
  }

  static async getTree(
    db: lf$Database,
    tx: lf$Transaction,
    derivationId: number,
    commonPrefix: Array<number>,
    queryPath: BIP32QueryPath,
  ): Promise<PathMapType> {
    const pathMap = new Map([[derivationId, commonPrefix]]);
    const result = await _getTree(
      db,
      tx,
      pathMap,
      commonPrefix.concat(queryPath),
      commonPrefix.length,
    );
    return result;
  }
}
const _getTree = async (
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
  const derivationSchema = GetDerivationsByPath.ownTables[KeyDerivationSchema.name];

  const derivationTable = db.getSchema().table(derivationSchema.name);
  const conditions = [
    derivationTable[derivationSchema.properties.Parent].in(
      Array.from<number>(pathMap.keys())
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

  const queryResult: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>> = await tx.attach(query);
  const nextPathMap = new Map(queryResult.map(row => {
    if (row.Parent == null) throw new Error('bip44::_getDerivationsByPath Should never happen');
    const path = pathMap.get(row.Parent);
    if (path == null) throw new Error('bip44::_getDerivationsByPath Should never happen');
    if (row.Index === null) throw new Error('bip44::_getDerivationsByPath null child index');
    return [
      row.KeyDerivationId,
      path.concat([row.Index])
    ];
  }));
  if (nextPathMap.size === 0) {
    throw new Error('bip44::_getDerivationsByPath no result');
  }

  const result = _getTree(
    db,
    tx,
    nextPathMap,
    queryPath,
    currPathIndex + 1,
  );
  return result;
};

export type GetPathWithSpecificByTreeRequest = {
  startingDerivation: number,
  derivationLevel: number,
  commonPrefix: Array<number>,
  queryPath: Array<number | null>,
};

type GetPathWithSpecificRequest = {
  pubDeriverKeyDerivationId: number,
  pathToLevel: Array<number>,
  level: number,
};
export class GetPathWithSpecific {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetDerivationsByPath,
    GetDerivationSpecific,
  });

  static async getPath<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: GetPathWithSpecificRequest,
  ): Promise<{
    path: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>>,
    levelSpecific: Row,
  }> {
    const path = await GetPathWithSpecific.depTables.GetDerivationsByPath.getSinglePath(
      db, tx,
      request.pubDeriverKeyDerivationId,
      request.pathToLevel,
    );
    const chainDerivation = path[path.length - 1];
    const levelSpecificRow = await GetPathWithSpecific.depTables.GetDerivationSpecific.get<Row>(
      db, tx,
      [chainDerivation.KeyDerivationId],
      DerivationLevels.CHAIN.level,
    );
    if (levelSpecificRow.length === 0) {
      // we know this level exists since we fetched it in GetDerivationsByPath
      throw new Error('GetPathWithSpecific::getPath should never happen');
    }
    return {
      path,
      levelSpecific: levelSpecificRow[0],
    };
  }

  static async getTree<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: GetPathWithSpecificByTreeRequest,
  ): Promise<{
    pathMap: PathMapType,
    rows: $ReadOnlyArray<$ReadOnly<Row>>,
  }> {
    const pathMap = await GetDerivationsByPath.getTree(
      db, tx,
      request.startingDerivation,
      request.commonPrefix,
      request.queryPath
    );
    const rows = await GetDerivationSpecific.get<Row>(
      db, tx,
      Array.from(pathMap.keys()),
      request.derivationLevel + request.queryPath.length,
    );

    return {
      pathMap,
      rows,
    };
  }
}


export class GetPublicDeriver {
  static ownTables = Object.freeze({
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<PublicDeriverRow> | void> {
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
  ): Promise<$ReadOnly<PrivateDeriverRow> | void> {
    return await getRowFromKey<PrivateDeriverRow>(
      db, tx,
      key,
      GetPrivateDeriver.ownTables[Tables.PrivateDeriverSchema.name].name,
      GetPrivateDeriver.ownTables[Tables.PrivateDeriverSchema.name].properties.Bip44WrapperId,
    );
  }
}

export class GetKeyForDerivation {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetKeyDerivation,
    GetKey,
  });

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    derivationId: number,
    getPublic: boolean,
    getPrivate: boolean,
  ): Promise<{
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    publicKey: $ReadOnly<KeyRow> | null | void,
    privateKey: $ReadOnly<KeyRow> | null | void,
  }> {
    const keyDerivationRow = await GetKeyForDerivation.depTables.GetKeyDerivation.get(
      db, tx,
      derivationId,
    );
    if (keyDerivationRow === undefined) {
      throw new StaleStateError('GetKeyForDerivation::get keyDerivationRow');
    }

    let publicKey;
    if (getPublic) {
      if (keyDerivationRow.PublicKeyId === null) {
        publicKey = null;
      } else {
        publicKey = await GetKeyForDerivation.depTables.GetKey.get(
          db, tx,
          keyDerivationRow.PublicKeyId,
        );
      }
    }
    let privateKey;
    if (getPrivate) {
      if (keyDerivationRow.PrivateKeyId === null) {
        privateKey = null;
      } else {
        privateKey = await GetKeyForDerivation.depTables.GetKey.get(
          db, tx,
          keyDerivationRow.PrivateKeyId,
        );
      }
    }

    return {
      KeyDerivation: keyDerivationRow,
      publicKey,
      privateKey,
    };
  }
}


export class GetKeyForPrivateDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetKeyForDerivation,
    GetPrivateDeriver,
  });

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    bip44WrapperId: number,
    getPublic: boolean,
    getPrivate: boolean,
  ): Promise<{
    PrivateDeriver: $ReadOnly<PrivateDeriverRow>,
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    publicKey: $ReadOnly<KeyRow> | null | void,
    privateKey: $ReadOnly<KeyRow> | null | void,
  }> {
    const result = await GetKeyForPrivateDeriver.depTables.GetPrivateDeriver.fromBip44Wrapper(
      db, tx,
      bip44WrapperId,
    );
    if (result === undefined) {
      throw new StaleStateError('GetKeyForPrivateDeriver::get GetPrivateDeriver');
    }

    const derivationAndKey = await GetKeyForPrivateDeriver.depTables.GetKeyForDerivation.get(
      db, tx,
      result.KeyDerivationId,
      getPublic,
      getPrivate,
    );

    return {
      ...derivationAndKey,
      PrivateDeriver: result,
    };
  }
}

export class GetKeyForPublicDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetKeyForDerivation,
    GetPublicDeriver,
  });

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
    getPublic: boolean,
    getPrivate: boolean,
  ): Promise<{
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    publicKey: $ReadOnly<KeyRow> | null | void,
    privateKey: $ReadOnly<KeyRow> | null | void,
  }> {
    const result = await GetKeyForPublicDeriver.depTables.GetPublicDeriver.get(
      db, tx,
      key,
    );
    if (result === undefined) {
      throw new StaleStateError('GetKeyForPublicDeriver::get GetPublicDeriver');
    }

    const derivationAndKey = await GetKeyForPublicDeriver.depTables.GetKeyForDerivation.get(
      db, tx,
      result.KeyDerivationId,
      getPublic,
      getPrivate,
    );

    return {
      ...derivationAndKey,
      PublicDeriver: result,
    };
  }
}

export class GetAllBip44Wallets {
  static ownTables = Object.freeze({
    [Tables.Bip44WrapperSchema.name]: Tables.Bip44WrapperSchema,
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<{
    Bip44Wrapper: $ReadOnly<Bip44WrapperRow>,
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
  }>> {
    const publicDeriverTable = db.getSchema().table(
      GetAllBip44Wallets.ownTables[Tables.PublicDeriverSchema.name].name
    );
    const bip44WrapperTable = db.getSchema().table(
      GetAllBip44Wallets.ownTables[Tables.Bip44WrapperSchema.name].name
    );
    const query = db
      .select()
      .from(bip44WrapperTable)
      .innerJoin(
        publicDeriverTable,
        publicDeriverTable[Tables.PublicDeriverSchema.properties.Bip44WrapperId].eq(
          bip44WrapperTable[Tables.Bip44WrapperSchema.properties.Bip44WrapperId]
        )
      );

    return await tx.attach(query);
  }
}

export class GetLastSyncForPublicDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetPublicDeriver,
    ReadLastSyncInfo,
  });

  static async forId(
    db: lf$Database,
    tx: lf$Transaction,
    publicDeriverId: number,
  ): Promise<$ReadOnly<LastSyncInfoRow>> {
    const pubDeriverRow = await GetLastSyncForPublicDeriver.depTables.GetPublicDeriver.get(
      db, tx,
      publicDeriverId
    );
    if (pubDeriverRow === undefined) {
      throw new StaleStateError('GetLastSyncForPublicDeriver::forId pubDeriverRow');
    }

    const syncInfo = await GetLastSyncForPublicDeriver.depTables.ReadLastSyncInfo.getLastSyncInfo(
      db, tx,
      pubDeriverRow.LastSyncInfoId
    );
    if (syncInfo === undefined) {
      throw new StaleStateError('GetLastSyncForPublicDeriver::forId syncInfo');
    }
    return syncInfo;
  }
}
