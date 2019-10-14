// @flow

import type {
  lf$Database,
  lf$Transaction,
  lf$Predicate,
} from 'lovefield';
import { op } from 'lovefield';

import type {
  AddressRow,
  KeyDerivationRow,
  BlockRow,
  EncryptionMetaRow,
  KeyRow,
} from '../tables';
import * as Tables from '../tables';
import { getRowFromKey, getRowIn, StaleStateError, } from '../../utils';

export class GetKey {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<KeyRow> | void> {
    return await getRowFromKey<KeyRow>(
      db, tx,
      key,
      GetKey.ownTables[Tables.KeySchema.name].name,
      GetKey.ownTables[Tables.KeySchema.name].properties.KeyId,
    );
  }
}

export class GetBlock {
  static ownTables = Object.freeze({
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables = Object.freeze({});

  static async byIds(
    db: lf$Database,
    tx: lf$Transaction,
    blockId: Array<number>,
  ): Promise<$ReadOnly<BlockRow> | void> {
    return await getRowIn<BlockRow>(
      db, tx,
      GetBlock.ownTables[Tables.BlockSchema.name].name,
      GetBlock.ownTables[Tables.BlockSchema.name].properties.BlockId,
      blockId,
    );
  }

  static async byDigests(
    db: lf$Database,
    tx: lf$Transaction,
    digests: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<BlockRow>>> {
    return await getRowIn<BlockRow>(
      db, tx,
      GetBlock.ownTables[Tables.BlockSchema.name].name,
      GetBlock.ownTables[Tables.BlockSchema.name].properties.Digest,
      digests,
    );
  }
}

export class GetAddress {
  static ownTables = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
  });
  static depTables = Object.freeze({});

  static async getById(
    db: lf$Database,
    tx: lf$Transaction,
    ids: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
    return await getRowIn<AddressRow>(
      db, tx,
      GetAddress.ownTables[Tables.AddressSchema.name].name,
      GetAddress.ownTables[Tables.AddressSchema.name].properties.AddressId,
      ids
    );
  }
}

export class GetEncryptionMeta {
  static ownTables = Object.freeze({
    [Tables.EncryptionMetaSchema.name]: Tables.EncryptionMetaSchema,
  });
  static depTables = Object.freeze({});

  static async exists(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<boolean> {
    const row = await getRowFromKey<EncryptionMetaRow>(
      db, tx,
      0,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].properties.EncryptionMetaId,
    );
    return row !== undefined;
  }

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnly<EncryptionMetaRow>> {
    const row = await getRowFromKey<EncryptionMetaRow>(
      db, tx,
      0,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].properties.EncryptionMetaId,
    );
    if (row === undefined) {
      throw new Error('GetEncryptionMeta::get no encryption meta found');
    }
    return row;
  }
}

export class GetChildIfExists {
  static ownTables = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    parentId: number,
    childIndex: number,
  ): Promise<void | $ReadOnly<KeyDerivationRow>> {
    const derivationSchema = GetChildIfExists.ownTables[Tables.KeyDerivationSchema.name];

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
  });

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    getSpecific: (derivationId: number) => Promise<$ReadOnly<Row>>,
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

    const levelSpecific = await getSpecific(derivation.KeyDerivationId);
    return {
      derivation,
      levelSpecific,
    };
  }
}

export class GetKeyDerivation {
  static ownTables = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
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
      GetKeyDerivation.ownTables[Tables.KeyDerivationSchema.name].name,
      GetKeyDerivation.ownTables[Tables.KeyDerivationSchema.name].properties.KeyDerivationId,
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
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
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
  const derivationSchema = GetDerivationsByPath.ownTables[Tables.KeyDerivationSchema.name];

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
  });

  static async getPath<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: GetPathWithSpecificRequest,
    getSpecific: (derivationId: number) => Promise<$ReadOnly<Row>>,
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
    const levelSpecific = await getSpecific(chainDerivation.KeyDerivationId);
    return {
      path,
      levelSpecific,
    };
  }

  static async getTree<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: GetPathWithSpecificByTreeRequest,
    getSpecific: (derivationIds: Array<number>) => Promise<$ReadOnlyArray<$ReadOnly<Row>>>,
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
    const rows = await getSpecific(Array.from(pathMap.keys()));

    return {
      pathMap,
      rows,
    };
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
