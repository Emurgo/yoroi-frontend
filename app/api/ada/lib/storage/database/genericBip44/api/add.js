// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  KeyDerivationInsert,
  KeyDerivationRow,
  PrivateDeriverInsert, PrivateDeriverRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperInsert, Bip44WrapperRow,
} from '../tables';
import * as Bip44Tables from '../tables';
import {
  GetKeyDerivation,
  GetChildIfExists,
  GetDerivation,
  GetPrivateDeriver,
} from './get';

import type { KeyInsert, KeyRow } from '../../uncategorized/tables';
import { AddKey, } from '../../uncategorized/api/add';
import { GetKey, } from '../../uncategorized/api/get';


import {
  allDerivationTables,
  TableMap,
} from './utils';
import { addToTable, StaleStateError, } from '../../utils';

export type TreeStart = {|
  derivationId: number,
  children: InsertTree,
|};

type InsertTree= Array<{|
  index: number,
  insert: {},
  children?: InsertTree,
|}>;

type InsertPath = Array<{
  index: number,
  insert: {},
}>;

export type AddDerivationRequest<Insert> = {|
  privateKeyInfo: KeyInsert | null,
  publicKeyInfo: KeyInsert | null,
  derivationInfo: {|
      private: number | null,
      public: number | null,
    |} => KeyDerivationInsert,
  levelInfo: number => Insert,
|};

export class AddDerivation {
  static ownTables = Object.freeze({
    ...allDerivationTables,
    [Bip44Tables.KeyDerivationSchema.name]: Bip44Tables.KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    AddKey,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddDerivationRequest<Insert>,
    level: number,
  ): Promise<{
    KeyDerivation: KeyDerivationRow,
    specificDerivationResult: Row,
  }> {
    const tableName = TableMap.get(level);
    if (tableName == null) {
      throw new Error('AddDerivation::add Unknown table queried');
    }

    const privateKey = request.privateKeyInfo === null
      ? null
      : await AddDerivation.depTables.AddKey.add(
        db, tx,
        request.privateKeyInfo,
      );
    const publicKey = request.publicKeyInfo === null
      ? null
      : await AddDerivation.depTables.AddKey.add(
        db, tx,
        request.publicKeyInfo,
      );

    const KeyDerivation =
      await addToTable<KeyDerivationInsert, KeyDerivationRow>(
        db, tx,
        request.derivationInfo({
          private: privateKey ? privateKey.KeyId : null,
          public: publicKey ? publicKey.KeyId : null,
        }),
        AddDerivation.ownTables[Bip44Tables.KeyDerivationSchema.name].name,
      );

    const specificDerivationResult =
      await addToTable<Insert, Row>(
        db,
        tx,
        request.levelInfo(KeyDerivation.KeyDerivationId),
        tableName,
      );

    return {
      KeyDerivation,
      specificDerivationResult,
    };
  }
}

export class GetOrAdd {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetDerivation,
    AddDerivation,
    GetChildIfExists,
  });

  static async getOrAdd<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    parentDerivationId: number,
    childIndex: number,
    request: AddDerivationRequest<Insert>,
    childLevel: number,
  ): Promise<{
    KeyDerivation: KeyDerivationRow,
    specificDerivationResult: Row,
  }> {
    const childResult = await GetOrAdd.depTables.GetChildIfExists.get(
      db, tx,
      parentDerivationId,
      childIndex,
    );
    if (childResult !== undefined) {
      const specificDerivationResult = (await GetOrAdd.depTables.GetDerivation.get<Row>(
        db, tx,
        [childResult.KeyDerivationId],
        childLevel,
      ))[0];
      return {
        KeyDerivation: childResult,
        specificDerivationResult
      };
    }
    const addResult = await GetOrAdd.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request,
      childLevel,
    );
    return addResult;
  }
}

export class DeriveTree {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetOrAdd,
  });

  static async derive(
    db: lf$Database,
    tx: lf$Transaction,
    tree: TreeStart,
    level: number,
  ): Promise<{}> {
    const parentId = tree.derivationId;
    for (let i = 0; i < tree.children.length; i++) {
      const result = await DeriveTree.depTables.GetOrAdd.getOrAdd(
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
        level + 1,
      );
      if (tree.children[i].children != null) {
        await DeriveTree.derive(
          db, tx,
          {
            derivationId: result.KeyDerivation.KeyDerivationId,
            children: tree.children[i].children,
          },
          level + 1,
        );
      }
    }
    return {};
  }
}

export class AddBip44Wrapper {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44WrapperSchema.name]: Bip44Tables.Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44WrapperInsert,
  ): Promise<Bip44WrapperRow> {
    return await addToTable<Bip44WrapperInsert, Bip44WrapperRow>(
      db, tx,
      request,
      AddBip44Wrapper.ownTables[Bip44Tables.Bip44WrapperSchema.name].name,
    );
  }
}

export type PrivateDeriverRequest<Insert> = {
  /**
   * Path from root to the private deriver
   * Path should NOT include the level for private deriver
   * For ROOT, the index passed in is disregarded
   */
  pathToPrivate: InsertPath,
  addLevelRequest: (number | null) => AddDerivationRequest<Insert>,
  addPrivateDeriverRequest: number => PrivateDeriverInsert,
};
export class AddPrivateDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PrivateDeriverSchema.name]: Bip44Tables.PrivateDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: PrivateDeriverRequest<Insert>,
  ): Promise<{
    privateDeriverResult: PrivateDeriverRow,
    levelResult: {
      KeyDerivation: KeyDerivationRow,
      specificDerivationResult: Row
    },
  }> {
    let parentId: number | null = null;
    for (let i = 0; i < request.pathToPrivate.length - 1; i++) {
      const levelResult = await AddPrivateDeriver.depTables.AddDerivation.add(
        db, tx,
        {
          privateKeyInfo: null,
          publicKeyInfo: null,
          // eslint-disable-next-line no-loop-func
          derivationInfo: keyInfo => ({
            PublicKeyId: keyInfo.private,
            PrivateKeyId: keyInfo.public,
            Parent: parentId,
            // explicitly ignore index for ROOT since it has no index
            Index: i === 0  ? null : request.pathToPrivate[i].index,
          }),
          levelInfo: id => ({
            KeyDerivationId: id,
            ...request.pathToPrivate[i].insert,
          }),
        },
        i,
      );
      parentId = levelResult.KeyDerivation.KeyDerivationId;
    }

    const levelResult = await AddPrivateDeriver.depTables.AddDerivation.add(
      db, tx,
      request.addLevelRequest(parentId),
      request.pathToPrivate.length,
    );
    const privateDeriverResult = await addToTable<PrivateDeriverInsert, PrivateDeriverRow>(
      db, tx,
      request.addPrivateDeriverRequest(levelResult.KeyDerivation.KeyDerivationId),
      AddPrivateDeriver.ownTables[Bip44Tables.PrivateDeriverSchema.name].name,
    );

    return {
      privateDeriverResult,
      levelResult,
    };
  }
}

export type PublicDeriverRequest<Insert> = {
  addLevelRequest: AddDerivationRequest<Insert>,
  level: number,
  addPublicDeriverRequest: number => PublicDeriverInsert,
};
export type DerivedPublicDeriverRequest<Insert> = {
  addLevelRequest: AddDerivationRequest<Insert>,
  level: number,
  addPublicDeriverRequest: number => PublicDeriverInsert,
};
export class AddPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: PublicDeriverRequest<Insert>,
  ): Promise<{
    publicDeriverResult: PublicDeriverRow,
    levelResult: {
      KeyDerivation: KeyDerivationRow,
      specificDerivationResult: Row
    },
  }> {
    const levelResult = await AddPublicDeriver.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const publicDeriverResult = await addToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request.addPublicDeriverRequest(levelResult.KeyDerivation.KeyDerivationId),
      AddPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name,
    );
    return {
      publicDeriverResult,
      levelResult,
    };
  }
}

export type DerivePublicFromPrivateRequest= {|
  publicDeriverInsert: number => PublicDeriverInsert,
  /**
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   */
  pathToPublic: InsertPath,
|};
export class DerivePublicFromPrivate {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    AddPublicDeriver,
    GetPrivateDeriver,
    GetKeyDerivation,
    GetKey,
    GetOrAdd,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    bip44WrapperId: number,
    body: DerivePublicFromPrivateRequest,
    getKeyInserts: (
      privateKeyRow: KeyRow,
    ) => {
      newPrivateKey: KeyInsert | null,
      newPublicKey: KeyInsert | null,
    }
  ): Promise<{
    publicDeriverResult: PublicDeriverRow,
    levelResult: {
      KeyDerivation: KeyDerivationRow,
      specificDerivationResult: Row
    },
  }> {
    let privateDeriverRow: PrivateDeriverRow;
    {
      // Get Private Deriver
      const result = await DerivePublicFromPrivate.depTables.GetPrivateDeriver.fromBip44Wrapper(
        db, tx,
        bip44WrapperId,
      );
      if (result === undefined) {
        throw new StaleStateError('DerivePublicFromPrivateRequest::add privateDeriver');
      }
      privateDeriverRow = result;
    }

    let privateKeyId: number;
    {
      // Private Deriver => KeyDerivation
      const result = await DerivePublicFromPrivate.depTables.GetKeyDerivation.get(
        db, tx,
        privateDeriverRow.KeyDerivationId,
      );
      if (result === undefined) {
        throw new StaleStateError('DerivePublicFromPrivateRequest::add Bip44DerivationTable');
      }
      if (result.PrivateKeyId === null) {
        throw new StaleStateError('DerivePublicFromPrivateRequest::add PrivateKeyId');
      }
      privateKeyId = result.PrivateKeyId;
    }

    let privateKeyRow: KeyRow;
    {
      // KeyDerivation => Private key
      const result = await DerivePublicFromPrivate.depTables.GetKey.get(
        db, tx,
        privateKeyId,
      );
      if (result === undefined) {
        throw new StaleStateError('DerivePublicFromPrivateRequest::add KeyTable');
      }
      privateKeyRow = result;
    }

    const newKeys = getKeyInserts(
      privateKeyRow,
    );

    let pubDeriver;
    {
      // get parent of the new derivation
      if (body.pathToPublic.length === 0) {
        throw new Error('DerivePublicFromPrivate::add invalid pathToPublic length');
      }
      let parentId = privateDeriverRow.KeyDerivationId;
      for (let i = 0; i < body.pathToPublic.length - 1; i++) {
        const nextLevel = await DerivePublicFromPrivate.depTables.GetOrAdd.getOrAdd(
          db, tx,
          parentId,
          body.pathToPublic[i].index,
          {
            privateKeyInfo: null,
            publicKeyInfo: null,
            // eslint-disable-next-line no-loop-func
            derivationInfo: keyInfo => ({
              PublicKeyId: keyInfo.private,
              PrivateKeyId: keyInfo.public,
              Parent: parentId,
              Index: body.pathToPublic[i].index,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
              ...body.pathToPublic[i].insert,
            }),
          },
          privateDeriverRow.Level + i + 1,
        );
        parentId = nextLevel.KeyDerivation.KeyDerivationId;
      }
      pubDeriver = await DerivePublicFromPrivate.depTables.AddPublicDeriver.add(
        db, tx,
        {
          addLevelRequest: {
            privateKeyInfo: newKeys.newPrivateKey,
            publicKeyInfo: newKeys.newPublicKey,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Parent: parentId,
              Index: body.pathToPublic[body.pathToPublic.length - 1].index,
            }),
            levelInfo: id => ({
              KeyDerivationId: id,
              ...body.pathToPublic[body.pathToPublic.length - 1].insert,
            }),
          },
          level: privateDeriverRow.Level + body.pathToPublic.length,
          addPublicDeriverRequest: body.publicDeriverInsert
        }
      );
    }

    return pubDeriver;
  }
}
