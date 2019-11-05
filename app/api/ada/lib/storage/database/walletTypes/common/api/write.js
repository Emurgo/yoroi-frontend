// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import { AddDerivation, GetOrAddDerivation, } from '../../../primitives/api/write';
import type {
  AddDerivationRequest,
  DerivationQueryResult,
} from '../../../primitives/api/write';
import type {
  KeyRow,
} from '../../../primitives/tables';
import type {
  HwWalletMetaInsert, HwWalletMetaRow,
} from '../../core/tables';
import { StaleStateError, } from '../../../utils';
import {
  GetKeyForDerivation,
} from '../../../primitives/api/read';
import { AddPublicDeriver, ModifyHwWalletMeta, } from '../../core/api/write';
import { GetPublicDeriver } from '../../core/api/read';
import type { AddPublicDeriverResponse } from '../../core/api/write';

import type {
  TreeInsertStart, TreeInsert,
  TreeResultStart, TreeResult,
  InsertPath,
} from '../utils';

export class AddDerivationTree {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetOrAddDerivation,
    AddDerivation,
  });

  static async excludingParent(
    db: lf$Database,
    tx: lf$Transaction,
    tree: TreeInsertStart,
    tableMap: Map<number, string>,
    level: number,
  ): Promise<TreeResult<any>> {
    const parentId = tree.derivationId;

    const result = [];
    for (let i = 0; i < tree.children.length; i++) {
      const tableName = tableMap.get(level + 1);
      if (tableName == null) {
        throw new Error('AddDerivationTree::excludingParent Unknown table queried');
      }
      const child = await AddDerivationTree.depTables.GetOrAddDerivation.getOrAdd(
        db, tx,
        parentId,
        tree.children[i].index,
        {
          privateKeyInfo: null,
          publicKeyInfo: null,
          derivationInfo: keyInfo => ({
            PublicKeyId: keyInfo.private,
            PrivateKeyId: keyInfo.public,
            Parent: parentId,
            Index: tree.children[i].index,
          }),
          levelInfo: id => ({
            KeyDerivationId: id,
            ...tree.children[i].insert,
          }),
        },
        tableName,
      );
      // recursively call down to the next level
      const children = tree.children[i].children == null
        ? undefined
        : await AddDerivationTree.excludingParent(
          db, tx,
          {
            derivationId: child.KeyDerivation.KeyDerivationId,
            children: tree.children[i].children,
          },
          tableMap,
          level + 1,
        );
      result.push({
        index: tree.children[i].index,
        result: child,
        children,
      });
    }
    return result;
  }

  /**
   * Note: assumes parent doesn't exist (will always be added)
   */
  static async includingParent<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    rootInsert: AddDerivationRequest<Insert>,
    tableMap: Map<number, string>,
    startingLevel: number,
    tree: number => TreeInsertStart,
  ): Promise<TreeResultStart<Row>> {
    const tableName = tableMap.get(startingLevel);
    if (tableName == null) {
      throw new Error('AddDerivationTree::includingParent Unknown table queried');
    }
    const root = await AddDerivationTree.depTables.AddDerivation.add(
      db, tx,
      rootInsert,
      tableName,
    );
    const children = await AddDerivationTree.excludingParent(
      db, tx,
      tree(root.KeyDerivation.KeyDerivationId),
      tableMap,
      startingLevel + 1,
    );
    return {
      root,
      children,
    };
  }

  static async fromSinglePath<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      // note: create level
      parentDerivationId: number | null,
      path: InsertPath,
      pathStartLevel: number,
    |},
    tableMap: Map<number, string>,
  ): Promise<Array<DerivationQueryResult<Row>>> {
    let parentId = request.parentDerivationId;
    const result = [];
    for (let i = 0; i < request.path.length; i++) {
      const tableName = tableMap.get(request.pathStartLevel + i);
      if (tableName == null) {
        throw new Error('AddDerivationTree::fromSinglePath Unknown table queried');
      }
      const levelResult = await AddDerivationTree.depTables.GetOrAddDerivation.getOrAdd(
        db, tx,
        parentId,
        request.path[i].index,
        {
          privateKeyInfo: request.path[i].privateKey,
          publicKeyInfo: request.path[i].publicKey,
          // eslint-disable-next-line no-loop-func
          derivationInfo: keyInfo => ({
            PublicKeyId: keyInfo.private,
            PrivateKeyId: keyInfo.public,
            Parent: parentId,
            // explicitly ignore index for ROOT since it has no index
            Index: request.pathStartLevel + i === 0  ? null : request.path[i].index,
          }),
          levelInfo: id => ({
            ...request.path[i].insert,
            KeyDerivationId: id,
          }),
        },
        tableName,
      );
      parentId = levelResult.KeyDerivation.KeyDerivationId;
      result.push(levelResult);
    }
    return result;
  }
}

export type DerivePublicDeriverFromKeyRequest = {|
  publicDeriverMeta: {|
    name: string,
  |},
  /**
   * Need this as no guarantee the path is same for each key
   * ex: different coin types
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   *
   * Note: path should NOT include parent (if one exists)
   */
  pathToPublic: (
    privateKeyRow: $ReadOnly<KeyRow>,
  ) => InsertPath,
  initialDerivations: TreeInsert<any>,
|};
export class DerivePublicDeriverFromKey {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetPublicDeriver,
    AddPublicDeriver,
    GetKeyForDerivation,
    GetOrAddDerivation,
    AddDerivationTree,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    body: DerivePublicDeriverFromKeyRequest,
    privateDeriverKeyDerivationId: number,
    privateDeriverLevel: number,
    conceptualWalletId: number,
    tableMap: Map<number, string>,
  ): Promise<AddPublicDeriverResponse<Row>> {
    const derivationAndKey = await DerivePublicDeriverFromKey.depTables.GetKeyForDerivation.get(
      db, tx,
      privateDeriverKeyDerivationId,
      false,
      true,
    );
    if (derivationAndKey.privateKey == null) {
      throw new StaleStateError('DerivePublicDeriverFromKey::add privateKey');
    }
    const derivedPath = body.pathToPublic(
      derivationAndKey.privateKey,
    );

    // TODO: refactor to use fromSinglePathWithKey ?
    if (derivedPath.length === 0) {
      throw new Error('DerivePublicDeriverFromKey::add derivedPath');
    }
    const pathResult = await DerivePublicDeriverFromKey.depTables.AddDerivationTree.fromSinglePath(
      db, tx,
      {
        parentDerivationId: privateDeriverKeyDerivationId,
        path: derivedPath.slice(0, derivedPath.length - 1),
        pathStartLevel: privateDeriverLevel + 1, // +1 since private deriver isn't included in path
      },
      tableMap,
    );

    const existingWallets = await AddAdhocPublicDeriver.depTables.GetPublicDeriver.forWallet(
      db, tx,
      conceptualWalletId,
    );

    let pubDeriver;
    {
      const tableName = tableMap.get(
        privateDeriverLevel + derivedPath.length
      );
      if (tableName == null) {
        throw new Error('AddDerivation::add Unknown table queried');
      }
      pubDeriver = await DerivePublicDeriverFromKey.depTables.AddPublicDeriver.add(
        db, tx,
        {
          addLevelRequest: {
            privateKeyInfo: derivedPath[derivedPath.length - 1].privateKey,
            publicKeyInfo: derivedPath[derivedPath.length - 1].publicKey,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: pathResult.length === 0
                ? privateDeriverKeyDerivationId
                : pathResult[pathResult.length - 1].KeyDerivation.KeyDerivationId,
              Index: derivedPath[derivedPath.length - 1].index,
            }),
            levelInfo: id => ({
              ...derivedPath[derivedPath.length - 1].insert,
              KeyDerivationId: id,
            }),
          },
          levelSpecificTableName: tableName,
          addPublicDeriverRequest: ids => ({
            ConceptualWalletId: conceptualWalletId,
            KeyDerivationId: ids.derivationId,
            Name: body.publicDeriverMeta.name,
            Index: existingWallets.length,
            LastSyncInfoId: ids.lastSyncInfoId,
          }),
        }
      );
    }

    await DerivePublicDeriverFromKey.depTables.AddDerivationTree.excludingParent(
      db, tx,
      {
        derivationId: pubDeriver.publicDeriverResult.KeyDerivationId,
        children: body.initialDerivations,
      },
      tableMap,
      privateDeriverLevel + derivedPath.length,
    );

    return pubDeriver;
  }
}

export type AddAdhocPublicDeriverRequest = {|
  parentDerivationId: number,
  pathStartLevel: number,
  /**
   * Need this as no guarantee the path is same for each key
   * ex: different coin types
   * Last index should be the index you want for the public deriver
   *
   * Note: path should NOT include parent (if one exists)
   */
  pathToPublic: InsertPath,
  publicDeriverMeta: {|
    name: string,
  |},
  initialDerivations: TreeInsert<any>,
  hwWalletMetaInsert?: HwWalletMetaInsert,
|}
export type AddAdhocPublicDeriverResponse<Row> = {|
  publicDeriver: AddPublicDeriverResponse<Row>,
  hwWalletMeta: void | $ReadOnly<HwWalletMetaRow>,
|}
export class AddAdhocPublicDeriver {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetPublicDeriver,
    AddDerivation,
    AddPublicDeriver,
    ModifyHwWalletMeta,
    AddDerivationTree,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddAdhocPublicDeriverRequest,
    conceptualWalletId: number,
    tableMap: Map<number, string>,
  ): Promise<AddAdhocPublicDeriverResponse<Row>> {
    const pathResult = await AddAdhocPublicDeriver.depTables.AddDerivationTree.fromSinglePath(
      db, tx,
      {
        parentDerivationId: request.parentDerivationId,
        path: request.pathToPublic.slice(0, request.pathToPublic.length - 1),
        pathStartLevel: request.pathStartLevel,
      },
      tableMap,
    );

    const tableName = tableMap.get(
      // -1 since pathStartLevel is included in pathToPublic
      request.pathStartLevel + request.pathToPublic.length - 1
    );
    if (tableName == null) {
      throw new Error('AddDerivation::add Unknown table queried');
    }

    const existingWallets = await AddAdhocPublicDeriver.depTables.GetPublicDeriver.forWallet(
      db, tx,
      conceptualWalletId,
    );

    // TODO: refactor to use fromSinglePathWithKey ?
    const publicDeriver = await AddAdhocPublicDeriver.depTables.AddPublicDeriver.add(
      db, tx,
      {
        addLevelRequest: {
          privateKeyInfo: request.pathToPublic[request.pathToPublic.length - 1].privateKey,
          publicKeyInfo: request.pathToPublic[request.pathToPublic.length - 1].publicKey,
          derivationInfo: keys => ({
            PublicKeyId: keys.public,
            PrivateKeyId: keys.private,
            Parent: pathResult.length === 0
              ? request.parentDerivationId
              : pathResult[pathResult.length - 1].KeyDerivation.KeyDerivationId,
            Index: request.pathToPublic[request.pathToPublic.length - 1].index,
          }),
          levelInfo: id => ({
            ...request.pathToPublic[request.pathToPublic.length - 1].insert,
            KeyDerivationId: id,
          }),
        },
        levelSpecificTableName: tableName,
        addPublicDeriverRequest: ids => ({
          ConceptualWalletId: conceptualWalletId,
          KeyDerivationId: ids.derivationId,
          Name: request.publicDeriverMeta.name,
          Index: existingWallets.length,
          LastSyncInfoId: ids.lastSyncInfoId,
        }),
      }
    );

    await AddAdhocPublicDeriver.depTables.AddDerivationTree.excludingParent(
      db, tx,
      {
        derivationId: publicDeriver.publicDeriverResult.KeyDerivationId,
        children: request.initialDerivations,
      },
      tableMap,
      // -1 since pathStartLevel is included in pathToPublic
      request.pathStartLevel + request.pathToPublic.length - 1,
    );

    const hwWalletMeta = request.hwWalletMetaInsert == null
      ? undefined
      : await AddAdhocPublicDeriver.depTables.ModifyHwWalletMeta.add(
        db, tx,
        request.hwWalletMetaInsert
      );

    return {
      publicDeriver,
      hwWalletMeta,
    };
  }
}
