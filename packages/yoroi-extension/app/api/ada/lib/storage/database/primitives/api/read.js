// @flow

import type {
  lf$Database,
  lf$Transaction,
  lf$Predicate,
} from 'lovefield';
import lf, {
  op,
} from 'lovefield';

import type {
  AddressRow,
  KeyDerivationRow,
  BlockRow,
  EncryptionMetaInsert, EncryptionMetaRow,
  KeyRow,
  TransactionRow,
  AddressMappingRow,
  CertificateRow,
  CertificateAddressRow,
  CertificatePart,
  NetworkRow,
  TokenRow,
  TokenListRow,
} from '../tables';
import type {
  TxStatusCodesType,
  CoreAddressT,
} from '../enums';
import { TxStatusCodes } from '../enums';

import * as Tables from '../tables';
import {
  digestForHash,
} from './utils';
import { getAll, getRowFromKey, getRowIn, StaleStateError, } from '../../utils';

export class GetEncryptionMeta {
  static ownTables: {|
    EncryptionMeta: typeof Tables.EncryptionMetaSchema,
  |} = Object.freeze({
    [Tables.EncryptionMetaSchema.name]: Tables.EncryptionMetaSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async getOrInitial(
    db: lf$Database,
    tx: lf$Transaction,
    initial: EncryptionMetaInsert,
  ): Promise<EncryptionMetaRow> {
    const row = await getRowFromKey<EncryptionMetaRow>(
      db, tx,
      0,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].properties.EncryptionMetaId,
    );
    if (row == null) return initial;

    const rowCopy = { ...row }; // DB result is read-only, but we need to remove results
    Object.keys(rowCopy).forEach(key => {
      if (rowCopy[key] == null) {
        rowCopy[key] = initial[key];
      }
    });
    return rowCopy;
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
      throw new Error(`${nameof(GetEncryptionMeta)}::${nameof(GetEncryptionMeta.get)} no encryption meta found`);
    }
    return row;
  }
}

export class GetKey {
  static ownTables: {|
    Key: typeof Tables.KeySchema
  |} = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables: {||} = Object.freeze({});

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
  static ownTables: {|
    Block: typeof Tables.BlockSchema,
  |} = Object.freeze({
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async byIds(
    db: lf$Database,
    tx: lf$Transaction,
    blockId: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<BlockRow>>> {
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
  static ownTables: {|
    Address: typeof Tables.AddressSchema,
    AddressMapping: typeof Tables.AddressMappingSchema,
  |} = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
    [Tables.AddressMappingSchema.name]: Tables.AddressMappingSchema,
  });
  static depTables: {|GetEncryptionMeta: typeof GetEncryptionMeta|} = Object.freeze({
    GetEncryptionMeta
  });

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

  static async getByHash(
    db: lf$Database,
    tx: lf$Transaction,
    addressHash: Array<string>,
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
    const { AddressSeed } = await GetAddress.depTables.GetEncryptionMeta.get(db, tx);
    const digests = addressHash.map<number>(hash => digestForHash(hash, AddressSeed));

    const addressRows = await getRowIn<AddressRow>(
      db, tx,
      GetAddress.ownTables[Tables.AddressSchema.name].name,
      GetAddress.ownTables[Tables.AddressSchema.name].properties.Digest,
      digests
    );

    return addressRows;
  }

  static async fromCanonical(
    db: lf$Database,
    tx: lf$Transaction,
    keyDerivationId: Array<number>,
    /**
     * void -> do not filter by type
     */
    types: void | Array<CoreAddressT>,
  ): Promise<Map<number, Array<$ReadOnly<AddressRow>>>> {
    const mappingSchema = GetAddress.ownTables[Tables.AddressMappingSchema.name];
    const mappingTable = db.getSchema().table(mappingSchema.name);
    const addressSchema = GetAddress.ownTables[Tables.AddressSchema.name];
    const addressTable = db.getSchema().table(addressSchema.name);
    const query = db
      .select()
      .from(mappingTable)
      .innerJoin(
        addressTable,
        op.and(
          mappingTable[mappingSchema.properties.AddressId].eq(
            addressTable[addressSchema.properties.AddressId]
          ),
          ...(types != null
            ? [addressTable[addressSchema.properties.Type].in(
              types
            )]
            : []
          )
        )
      )
      .where(
        mappingTable[mappingSchema.properties.KeyDerivationId].in(
          keyDerivationId
        )
      );
    const result: $ReadOnlyArray<{|
      AddressMapping: $ReadOnly<AddressMappingRow>,
      Address: $ReadOnly<AddressRow>,
    |}> = await tx.attach(query);

    const addressRowMap: Map<number, Array<$ReadOnly<AddressRow>>> = result.reduce(
      (map, nextElement) => {
        const array = map.get(nextElement.AddressMapping.KeyDerivationId) || [];
        map.set(
          nextElement.AddressMapping.KeyDerivationId,
          [...array, nextElement.Address]
        );
        return map;
      },
      new Map()
    );
    return addressRowMap;
  }

  static async getKeyForFamily(
    db: lf$Database,
    tx: lf$Transaction,
    addressId: number,
  ): Promise<number | void> {
    const row = await getRowFromKey<AddressMappingRow>(
      db, tx,
      addressId,
      GetAddress.ownTables[Tables.AddressMappingSchema.name].name,
      GetAddress.ownTables[Tables.AddressMappingSchema.name].properties.AddressId,
    );
    return row === undefined
      ? row
      : row.KeyDerivationId;
  }
}

export class GetChildIfExists {
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {||} = Object.freeze({});

  /**
   * Note: can't support ROOT level
   * since you wouldn't be able to differentiate roots of different wallets
   */
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
  static ownTables: {||} = Object.freeze({});
  static depTables: {|GetChildIfExists: typeof GetChildIfExists|} = Object.freeze({
    GetChildIfExists,
  });

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    getSpecific: (derivationId: number) => Promise<$ReadOnly<Row>>,
    parentId: number,
    childIndex: number,
  ): Promise<void | {|
    derivation:  $ReadOnly<KeyDerivationRow>,
    levelSpecific: $ReadOnly<Row>,
  |}> {
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
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {||} = Object.freeze({});

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
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {|
    GetChildIfExists: typeof GetChildIfExists,
    GetKeyDerivation: typeof GetKeyDerivation,
  |} = Object.freeze({
    GetChildIfExists,
    GetKeyDerivation,
  });

  /**
   * Note: last element in return type is startingKey
   */
  static async getParentPath(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      startingKey: $ReadOnly<KeyDerivationRow>,
      numLevels: number,
    |},
  ): Promise<Array<$ReadOnly<KeyDerivationRow>>> {
    const path = [request.startingKey];
    for (let i = 0; i < request.numLevels; i++) {
      const parentId = path[path.length - 1].Parent;
      if (parentId === null) {
        throw new Error(`${nameof(GetDerivationsByPath)}::${nameof(this.getParentPath)} unexpected end`);
      }
      const parent = await GetDerivationsByPath.depTables.GetKeyDerivation.get(
        db, tx,
        parentId
      );
      if (parent === undefined) {
        throw new Error(`${nameof(GetDerivationsByPath)}::${nameof(this.getParentPath)} parent not found`);
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
      throw new Error(`${nameof(GetDerivationsByPath)}::${nameof(this.getSinglePath)} empty path`);
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
        throw new Error(`${nameof(GetDerivationsByPath)}::${nameof(this.getSinglePath)} no path from` + currDerivationId + ' to ' + index);
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
    queryPath: void | BIP32QueryPath,
  ): Promise<PathMapType> {
    const pathMap = new Map([[derivationId, commonPrefix]]);
    const result = await _getTree(
      db,
      tx,
      pathMap,
      queryPath ? commonPrefix.concat(queryPath) : undefined,
      commonPrefix.length,
    );
    return result;
  }

  static async allFromRoot(
    db: lf$Database,
    tx: lf$Transaction,
    rootId: number,
  ): Promise<$ReadOnlyArray<$ReadOnly<KeyDerivationRow>>> {
    const root = await GetDerivationsByPath.depTables.GetKeyDerivation.get(
      db, tx,
      rootId
    );
    if (root === undefined) {
      throw new Error(`${nameof(GetDerivationsByPath)}::${nameof(GetDerivationsByPath.getParentPath)} root not found`);
    }
    const result: Array<$ReadOnly<KeyDerivationRow>> = [];
    let keysForLevel: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>> = [root];
    const derivationSchema = GetDerivationsByPath.ownTables[Tables.KeyDerivationSchema.name];
    const derivationTable = db.getSchema().table(derivationSchema.name);

    while (keysForLevel.length !== 0) {
      result.push(...keysForLevel);
      const query = db
        .select()
        .from(derivationTable)
        .where(derivationTable[derivationSchema.properties.Parent].in(
          keysForLevel.map(row => row.KeyDerivationId)
        ));

      const queryResult: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>> = await tx.attach(query);
      keysForLevel = queryResult;
    }

    return result;
  }
}
const _getTree = async (
  db: lf$Database,
  tx: lf$Transaction,
  pathMap: PathMapType,
  queryPath: void | BIP32QueryPath,
  currPathIndex: number,
): Promise<PathMapType> => {
  // base case
  if (queryPath && currPathIndex === queryPath.length) {
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
  if (queryPath && queryPath[currPathIndex] !== null) {
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
    if (queryPath == null) return pathMap;
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

export type GetPathWithSpecificByTreeRequest = {|
  startingDerivation: number,
  derivationLevel: number,
  commonPrefix: Array<number>,
  queryPath: Array<number | null>,
|};

type GetPathWithSpecificRequest = {|
  pubDeriverKeyDerivationId: number,
  pathToLevel: Array<number>,
  level: number,
|};
export class GetPathWithSpecific {
  static ownTables: {||} = Object.freeze({});
  static depTables: {|GetDerivationsByPath: typeof GetDerivationsByPath|} = Object.freeze({
    GetDerivationsByPath,
  });

  static async getPath<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: GetPathWithSpecificRequest,
    getSpecific: (derivationId: number) => Promise<$ReadOnly<Row>>,
  ): Promise<{|
    path: $ReadOnlyArray<$ReadOnly<KeyDerivationRow>>,
    levelSpecific: Row,
  |}> {
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
  ): Promise<{|
    pathMap: PathMapType,
    rows: $ReadOnlyArray<$ReadOnly<Row>>,
  |}> {
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
  static ownTables: {||} = Object.freeze({});
  static depTables: {|
    GetKey: typeof GetKey,
    GetKeyDerivation: typeof GetKeyDerivation,
  |} = Object.freeze({
    GetKeyDerivation,
    GetKey,
  });

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    derivationId: number,
    getPublic: boolean,
    getPrivate: boolean,
  ): Promise<{|
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    publicKey: $ReadOnly<KeyRow> | null | void,
    privateKey: $ReadOnly<KeyRow> | null | void,
  |}> {
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

export class GetTransaction {
  static ownTables: {|
    Transaction: typeof Tables.TransactionSchema,
  |} = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async fromIds(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| ids: Array<number>, |},
  ): Promise<$ReadOnlyArray<$ReadOnly<TransactionRow>>> {
    return await getRowIn<TransactionRow>(
      db, tx,
      GetTransaction.ownTables[Tables.TransactionSchema.name].name,
      GetTransaction.ownTables[Tables.TransactionSchema.name].properties.TransactionId,
      request.ids,
    );
  }

  static async withStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      status: Array<TxStatusCodesType>,
    |},
  ): Promise<$ReadOnlyArray<$ReadOnly<TransactionRow>>> {
    const txTableMeta = GetTransaction.ownTables[Tables.TransactionSchema.name];
    const txTable = db.getSchema().table(
      txTableMeta.name
    );
    const query = db
      .select()
      .from(txTable)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Status].in(request.status),
      ));
    return await tx.attach(query);
  }

  static async byDigest(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      digests: Array<number>,
    |},
  ): Promise<Map<string, $ReadOnly<TransactionRow>>> {
    const txTableMeta = GetTransaction.ownTables[Tables.TransactionSchema.name];
    const txTable = db.getSchema().table(
      txTableMeta.name
    );
    const query = db
      .select()
      .from(txTable)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Digest].in(request.digests),
      ));
    const rows: $ReadOnlyArray<$ReadOnly<TransactionRow>> = await tx.attach(query);

    const mapToTx = new Map();
    for (const row of rows) {
      mapToTx.set(row.Hash, row);
    }
    return mapToTx;
  }
}

export class GetTxAndBlock {
    static ownTables: {|
    Block: typeof Tables.BlockSchema,
    Transaction: typeof Tables.TransactionSchema,
  |} = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async gteHeight(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      height: number,
    |},
  ): Promise<$ReadOnlyArray<{|
    Block: $ReadOnly<BlockRow>,
    Transaction: $ReadOnly<TransactionRow>,
  |}>> {
    const txTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.TransactionSchema.name].name
    );
    const blockTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.BlockSchema.name].name
    );
    const query = db.select()
      .from(txTable)
      .innerJoin(
        blockTable,
        txTable[Tables.TransactionSchema.properties.BlockId].eq(
          blockTable[Tables.BlockSchema.properties.BlockId]
        )
      )
      .where(op.and(
        blockTable[Tables.BlockSchema.properties.Height].gte(request.height),
        txTable[Tables.TransactionSchema.properties.TransactionId].in(request.txIds)
      ));

    const queryResult: $ReadOnlyArray<{|
      Block: $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}> = await tx.attach(query);

    return queryResult;
  }

  static async firstSuccessTxBefore(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      height: number,
    |},
  ): Promise<void | {|
    Block: $ReadOnly<BlockRow>,
    Transaction: $ReadOnly<TransactionRow>,
  |}> {
    const txTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.TransactionSchema.name].name
    );
    const blockTable = db.getSchema().table(
      GetTxAndBlock.ownTables[Tables.BlockSchema.name].name
    );
    const query = db.select()
      .from(txTable)
      .innerJoin(
        blockTable,
        txTable[Tables.TransactionSchema.properties.BlockId].eq(
          blockTable[Tables.BlockSchema.properties.BlockId]
        )
      )
      .orderBy(blockTable[Tables.BlockSchema.properties.Height], lf.Order.DESC)
      .orderBy(txTable[Tables.TransactionSchema.properties.Ordinal], lf.Order.DESC)
      .where(op.and(
        blockTable[Tables.BlockSchema.properties.Height].lt(request.height),
        txTable[Tables.TransactionSchema.properties.TransactionId].in(request.txIds),
        txTable[Tables.TransactionSchema.properties.Status].eq(TxStatusCodes.IN_BLOCK),
      ))
      .limit(1);

    const queryResult: $ReadOnlyArray<{|
      Block: $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}> = await tx.attach(query);

    if (queryResult.length === 0) {
      return undefined;
    }
    return queryResult[0];
  }

  static async byTime(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      skip?: number,
      limit?: number,
    |},
  ): Promise<$ReadOnlyArray<{|
    Transaction: $ReadOnly<TransactionRow>,
    Block: null | $ReadOnly<BlockRow>,
  |}>> {
    const txTableMeta = GetTxAndBlock.ownTables[Tables.TransactionSchema.name];
    const blockTableMeta = GetTxAndBlock.ownTables[Tables.BlockSchema.name];
    const txTable = db.getSchema().table(txTableMeta.name);
    const blockTable = db.getSchema().table(blockTableMeta.name);
    const query = db
      .select()
      .from(txTable)
      .leftOuterJoin(
        blockTable,
        txTable[txTableMeta.properties.BlockId].eq(
          blockTable[blockTableMeta.properties.BlockId]
        )
      )
      .orderBy(txTable[txTableMeta.properties.LastUpdateTime], lf.Order.DESC)
      .orderBy(txTable[txTableMeta.properties.Ordinal], lf.Order.DESC)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
      ));
    if (request.limit != null) {
      query.limit(request.limit);
    }
    if (request.skip != null) {
      query.skip(request.skip);
    }
    const result = await tx.attach(query);

    // convert leftOuterJoin notation
    return result.map(entry => {
      if (entry.Block.BlockId === null) {
        return {
          Transaction: entry.Transaction,
          Block: null
        };
      }
      return entry;
    });
  }

  static async withStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      txIds: Array<number>,
      status: Array<TxStatusCodesType>,
    |},
  ): Promise<$ReadOnlyArray<{|
    Transaction: $ReadOnly<TransactionRow>,
    Block: null | $ReadOnly<BlockRow>,
  |}>>  {
    const txTableMeta = GetTxAndBlock.ownTables[Tables.TransactionSchema.name];
    const blockTableMeta = GetTxAndBlock.ownTables[Tables.BlockSchema.name];
    const txTable = db.getSchema().table(txTableMeta.name);
    const blockTable = db.getSchema().table(blockTableMeta.name);
    const query = db
      .select()
      .from(txTable)
      .leftOuterJoin(
        blockTable,
        txTable[txTableMeta.properties.BlockId].eq(
          blockTable[blockTableMeta.properties.BlockId]
        )
      )
      .orderBy(txTable[txTableMeta.properties.LastUpdateTime], lf.Order.DESC)
      .where(op.and(
        txTable[txTableMeta.properties.TransactionId].in(request.txIds),
        txTable[txTableMeta.properties.Status].in(request.status),
      ));
    const result = await tx.attach(query);

    // convert leftOuterJoin notation
    return result.map(entry => {
      if (entry.Block.BlockId === null) {
        return {
          Transaction: entry.Transaction,
          Block: null
        };
      }
      return entry;
    });
  }
}

export type CertificateForKey = {|
  ...CertificatePart,
  transaction: $ReadOnly<TransactionRow>,
  block: null | $ReadOnly<BlockRow>,
|};

export class GetCertificates {
  static ownTables: {|
    Block: typeof Tables.BlockSchema,
    Certificate: typeof Tables.CertificateSchema,
    CertificateAddress: typeof Tables.CertificateAddressSchema,
    Transaction: typeof Tables.TransactionSchema,
  |} = Object.freeze({
    [Tables.CertificateAddressSchema.name]: Tables.CertificateAddressSchema,
    [Tables.CertificateSchema.name]: Tables.CertificateSchema,
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables: {||} = Object.freeze({});

  // <TODO:PENDING_REMOVAL> needs redesign
  static async forAddress(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| addressIds: Array<number>, |},
  ): Promise<Array<CertificateForKey>> {
    const certAddrSchema = GetCertificates.ownTables[Tables.CertificateAddressSchema.name];
    const certSchema = GetCertificates.ownTables[Tables.CertificateSchema.name];
    const txSchema = GetCertificates.ownTables[Tables.TransactionSchema.name];
    const blockSchema = GetCertificates.ownTables[Tables.BlockSchema.name];
    const certAddrTable = db.getSchema().table(certAddrSchema.name);
    const certTable = db.getSchema().table(certSchema.name);
    const txTable = db.getSchema().table(txSchema.name);
    const blockTable = db.getSchema().table(blockSchema.name);
    const query = db
      .select()
      .from(certAddrTable)
      .innerJoin(
        certTable,
        certTable[certSchema.properties.CertificateId].eq(
          certAddrTable[certAddrSchema.properties.CertificateId]
        )
      )
      .innerJoin(
        txTable,
        certTable[certSchema.properties.TransactionId].eq(
          txTable[txSchema.properties.TransactionId]
        )
      )
      .leftOuterJoin(
        blockTable,
        txTable[txSchema.properties.BlockId].eq(
          blockTable[txSchema.properties.BlockId]
        )
      )
      .where(certAddrTable[certAddrSchema.properties.AddressId].in(
        request.addressIds
      ))
      .orderBy(blockTable[Tables.BlockSchema.properties.Height], lf.Order.DESC)
      .orderBy(txTable[Tables.TransactionSchema.properties.Ordinal], lf.Order.DESC)
      .orderBy(txTable[Tables.CertificateSchema.properties.Ordinal], lf.Order.DESC);

    const queryResult: $ReadOnlyArray<{|
      CertificateAddress: $ReadOnly<CertificateAddressRow>,
      Certificate: $ReadOnly<CertificateRow>,
      Transaction: $ReadOnly<TransactionRow>,
      Block: $ReadOnly<WithNullableFields<BlockRow>>,
    |}> = await tx.attach(query);

    const tempMap = new Map<number, {|
      transaction: $ReadOnly<TransactionRow>,
      block: null | $ReadOnly<BlockRow>,
      certificate: $ReadOnly<CertificateRow>,
      relatedAddresses: Array<$ReadOnly<CertificateAddressRow>>,
    |}>();
    for (const result of queryResult) {
      const entry = tempMap.get(result.Certificate.CertificateId);
      if (entry == null) {
        tempMap.set(
          result.Certificate.CertificateId,
          {
            relatedAddresses: [result.CertificateAddress],
            certificate: result.Certificate,
            transaction: result.Transaction,
            block: result.Block.BlockId == null
              ? null
              : ((result.Block: any): $ReadOnly<BlockRow>),
          }
        );
      } else {
        entry.relatedAddresses.push(result.CertificateAddress);
      }
    }

    return Array.from(tempMap.values())
      .map(result => ({ ...result })); // turn to read-only through shallow-copy
  }

  static async forTransactions(
    db: lf$Database,
    dbTx: lf$Transaction,
    request: {|
      txIds: Array<number>,
    |},
  ): Promise<Map<number, Array<CertificatePart>>> {
    const certAddrSchema = GetCertificates.ownTables[Tables.CertificateAddressSchema.name];
    const certSchema = GetCertificates.ownTables[Tables.CertificateSchema.name];
    const certAddrTable = db.getSchema().table(certAddrSchema.name);
    const certTable = db.getSchema().table(certSchema.name);
    const query = db
      .select()
      .from(certTable)
      .leftOuterJoin(
        certAddrTable,
        certTable[certSchema.properties.CertificateId].eq(
          certAddrTable[certAddrSchema.properties.CertificateId]
        )
      )
      .where(certTable[certSchema.properties.TransactionId].in(
        request.txIds
      ));

    const queryResult: $ReadOnlyArray<{|
      CertificateAddress: null | $ReadOnly<CertificateAddressRow>,
      Certificate: $ReadOnly<CertificateRow>,
    |}> = await dbTx.attach(query);

    // group by relation
    const relationsForCert = new Map<number /* cert id */, {|
      relatedAddresses: Array<$ReadOnly<CertificateAddressRow>>,
      certificate: $ReadOnly<CertificateRow>,
    |}>();
    for (const result of queryResult) {
      const entry = relationsForCert.get(result.Certificate.CertificateId);
      if (entry == null) {
        relationsForCert.set(
          result.Certificate.CertificateId,
          {
            relatedAddresses: result.CertificateAddress == null
              ? []
              : [result.CertificateAddress],
            certificate: result.Certificate,
          }
        );
      } else if (result.CertificateAddress != null) {
        entry.relatedAddresses.push(result.CertificateAddress);
      }
    }

    const groupByTxId = new Map<number /* txid */, Array<CertificatePart>>();
    for (const groupedCert of relationsForCert.values()) {
      const groupforTx = groupByTxId.get(groupedCert.certificate.TransactionId);
      if (groupforTx == null) {
        groupByTxId.set(
          groupedCert.certificate.TransactionId,
          [{ ...groupedCert }]
        );
      } else {
        groupforTx.push({ ...groupedCert });
      }
    }
    return groupByTxId;
  }
}

export class GetNetworks {
  static ownTables: {|
    Network: typeof Tables.NetworkSchema,
  |} = Object.freeze({
    [Tables.NetworkSchema.name]: Tables.NetworkSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<$ReadOnly<NetworkRow>>> {
    const rows = await getAll<NetworkRow>(
      db, tx,
      GetNetworks.ownTables[Tables.NetworkSchema.name].name,
    );
    return rows;
  }
}

export class GetToken {
  static ownTables: {|
    Token: typeof Tables.TokenSchema,
  |} = Object.freeze({
    [Tables.TokenSchema.name]: Tables.TokenSchema,
  });
  static depTables: {|GetEncryptionMeta: typeof GetEncryptionMeta|} = Object.freeze({
    GetEncryptionMeta,
  });

  static async all(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
    return getAll(
      db, tx,
      GetToken.ownTables[Tables.TokenSchema.name].name,
    );
  }

  static async fromIds(
    db: lf$Database,
    tx: lf$Transaction,
    tokenIds: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
    return getRowIn(
      db, tx,
      GetToken.ownTables[Tables.TokenSchema.name].name,
      GetToken.ownTables[Tables.TokenSchema.name].properties.TokenId,
      tokenIds
    );
  }
  static async fromIdentifier(
    db: lf$Database,
    tx: lf$Transaction,
    tokenIds: Array<string>,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
    const { TokenSeed } = await GetToken.depTables.GetEncryptionMeta.get(db, tx);
    const digests = tokenIds.map<number>(hash => digestForHash(hash, TokenSeed));
    return GetToken.fromDigest(db, tx, digests);
  }
  static async fromDigest(
    db: lf$Database,
    tx: lf$Transaction,
    digests: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
    const tokenRows = await getRowIn<TokenRow>(
      db, tx,
      GetToken.ownTables[Tables.TokenSchema.name].name,
      GetToken.ownTables[Tables.TokenSchema.name].properties.Digest,
      digests
    );

    return tokenRows;
  }
}

export class AssociateToken {
  static ownTables: {|
    TokenList: typeof Tables.TokenListSchema,
    Token: typeof Tables.TokenSchema,
  |} = Object.freeze({
    [Tables.TokenListSchema.name]: Tables.TokenListSchema,
    [Tables.TokenSchema.name]: Tables.TokenSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async nextTokenListId(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<number> {
    const tokenListTableMeta = AssociateToken.ownTables[Tables.TokenListSchema.name];

    const tokenListTable = db.getSchema().table(tokenListTableMeta.name);
    const query = db
      .select()
      .from(tokenListTable)
      .orderBy(tokenListTable[Tables.TokenListSchema.properties.ListId], lf.Order.DESC)
      .limit(1);
    const result: $ReadOnlyArray<$ReadOnly<TokenListRow>> = await tx.attach(query);
    if (result.length >= 1) {
      return result[0].ListId + 1;
    }
    return 0; // first entry in DB
  }

  static async forListId(
    db: lf$Database,
    tx: lf$Transaction,
    request: {| listIds: Array<number>, |},
  ): Promise<Map<number, Array<$ReadOnly<TokenListRow>>>> {
    const rows = await getRowIn<TokenListRow>(
      db, tx,
      AssociateToken.ownTables[Tables.TokenListSchema.name].name,
      AssociateToken.ownTables[Tables.TokenListSchema.name].properties.ListId,
      request.listIds,
    );

    const result = new Map<number, Array<$ReadOnly<TokenListRow>>>();
    for (const row of rows) {
      const { ListId } = row;
      if (ListId == null) continue;
      const entries = result.get(ListId) ?? [];
      entries.push(row);
      entries.sort((a,b) => a.TokenListItemId - b.TokenListItemId);
      result.set(ListId, entries);
    }

    return result;
  }

  static async join(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      listIds: Array<number>,
      networkId: number,
    |},
  ): Promise<$ReadOnlyArray<{|
    TokenList: $ReadOnly<TokenListRow>,
    Token: $ReadOnly<TokenRow>,
  |}>> {
    const tokenListTableMeta = AssociateToken.ownTables[Tables.TokenListSchema.name];
    const tokenTableMeta = AssociateToken.ownTables[Tables.TokenSchema.name];

    const tokenListTable = db.getSchema().table(tokenListTableMeta.name);
    const tokenTable = db.getSchema().table(tokenTableMeta.name);
    const query = db
      .select()
      .from(tokenListTable)
      .innerJoin(
        tokenTable,
        tokenListTable[tokenListTableMeta.properties.TokenId].eq(
          tokenTable[tokenTableMeta.properties.TokenId]
        )
      )
      .where(op.and(
        tokenListTable[tokenListTableMeta.properties.ListId].in(
          request.listIds
        ),
        tokenTable[tokenTableMeta.properties.NetworkId].eq(request.networkId)
      ));
    const result: $ReadOnlyArray<{|
      TokenList: $ReadOnly<TokenListRow>,
      Token: $ReadOnly<TokenRow>,
    |}> = await tx.attach(query);

    return [...result].sort((a,b) => a.TokenList.TokenListItemId - b.TokenList.TokenListItemId);
  }
}
