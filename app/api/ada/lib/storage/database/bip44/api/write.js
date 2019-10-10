// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import type {
  PrivateDeriverInsert, PrivateDeriverRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperInsert, Bip44WrapperRow,
  Bip44ChainRow,
  Bip44AddressRow,
} from '../tables';
import * as Bip44Tables from '../tables';
import {
  GetChildIfExists,
  GetChildWithSpecific,
  GetPathWithSpecific,
  GetDerivationSpecific,
  GetKeyForPrivateDeriver,
} from './read';

import type {
  KeyDerivationInsert, KeyDerivationRow,
  KeyInsert, KeyRow
} from '../../uncategorized/tables';
import { KeyDerivationSchema } from '../../uncategorized/tables';
import { AddKey, } from '../../uncategorized/api/write';

import {
  allDerivationTables,
  TableMap,
  DerivationLevels,
} from './utils';
import { addNewRowToTable, StaleStateError, } from '../../utils';
import { ModifyLastSyncInfo, ModifyHwWalletMeta } from '../../wallet/api/write';
import type { HwWalletMetaInsert, HwWalletMetaRow, } from '../../wallet/tables';

export type TreeStart = {|
  derivationId: number,
  children: TreeInsert<any>,
|};

// TODO: recursively typedef with $CALL ?
export type TreeInsert<T={}> = Array<{|
  index: number,
  insert: T,
  children?: TreeInsert<any>,
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
    [KeyDerivationSchema.name]: KeyDerivationSchema,
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
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    specificDerivationResult: $ReadOnly<Row>,
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
      await addNewRowToTable<KeyDerivationInsert, KeyDerivationRow>(
        db, tx,
        request.derivationInfo({
          private: privateKey ? privateKey.KeyId : null,
          public: publicKey ? publicKey.KeyId : null,
        }),
        AddDerivation.ownTables[KeyDerivationSchema.name].name,
      );

    const specificDerivationResult =
      await addNewRowToTable<Insert, Row>(
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

export class GetOrAddDerivation {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetDerivationSpecific,
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
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    specificDerivationResult: $ReadOnly<Row>,
  }> {
    const childResult = await GetOrAddDerivation.depTables.GetChildIfExists.get(
      db, tx,
      parentDerivationId,
      childIndex,
    );
    if (childResult !== undefined) {
      const specificDerivationResult = (
        await GetOrAddDerivation.depTables.GetDerivationSpecific.get<Row>(
          db, tx,
          [childResult.KeyDerivationId],
          childLevel,
        )
      )[0];
      return {
        KeyDerivation: childResult,
        specificDerivationResult
      };
    }
    const addResult = await GetOrAddDerivation.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request,
      childLevel,
    );
    return addResult;
  }
}

export class AddTree {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    GetOrAddDerivation,
  });

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    tree: TreeStart,
    level: number,
  ): Promise<{}> {
    const parentId = tree.derivationId;
    for (let i = 0; i < tree.children.length; i++) {
      const result = await AddTree.depTables.GetOrAddDerivation.getOrAdd(
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
        await AddTree.add(
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
  ): Promise<$ReadOnly<Bip44WrapperRow>> {
    return await addNewRowToTable<Bip44WrapperInsert, Bip44WrapperRow>(
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
    privateDeriverResult: $ReadOnly<PrivateDeriverRow>,
    levelResult: {
      KeyDerivation: $ReadOnly<KeyDerivationRow>,
      specificDerivationResult: $ReadOnly<Row>
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
    const privateDeriverResult = await addNewRowToTable<PrivateDeriverInsert, PrivateDeriverRow>(
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
  wrapperId: number,
  addPublicDeriverRequest: {
    derivationId: number,
    wrapperId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
};
export type DerivedPublicDeriverRequest<Insert> = {
  addLevelRequest: AddDerivationRequest<Insert>,
  level: number,
  addPublicDeriverRequest: {
    derivationId: number,
    wrapperId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
};
export type AddPublicDeriverResponse<Row> = {
  publicDeriverResult: $ReadOnly<PublicDeriverRow>,
  levelResult: {
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    specificDerivationResult: $ReadOnly<Row>
  },
};
export class AddPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
    ModifyLastSyncInfo,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: PublicDeriverRequest<Insert>,
  ): Promise<AddPublicDeriverResponse<Row>> {
    const levelResult = await AddPublicDeriver.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const lastSyncInfo = await ModifyLastSyncInfo.create(db, tx);
    const publicDeriverResult = await addNewRowToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request.addPublicDeriverRequest({
        derivationId: levelResult.KeyDerivation.KeyDerivationId,
        wrapperId: request.wrapperId,
        lastSyncInfoId: lastSyncInfo.LastSyncInfoId,
      }),
      AddPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name,
    );
    return {
      publicDeriverResult,
      levelResult,
    };
  }
}

export class ModifyPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async rename(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      pubDeriverId: number,
      newName: string,
    },
  ): Promise<void> {
    const publicDeriverTable = db.getSchema().table(
      ModifyPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name
    );
    const updateQuery = db
      .update(publicDeriverTable)
      .set(
        publicDeriverTable[Bip44Tables.PublicDeriverSchema.properties.Name],
        request.newName
      )
      .where(op.and(
        publicDeriverTable[Bip44Tables.PublicDeriverSchema.properties.PublicDeriverId].eq(
          request.pubDeriverId
        ),
      ));

    await tx.attach(updateQuery);
  }
}


export type DerivePublicFromPrivateRequest= {|
  publicDeriverInsert: {
    derivationId: number,
    wrapperId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
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
    GetKeyForPrivateDeriver,
    GetOrAddDerivation,
    AddTree,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    bip44WrapperId: number,
    body: DerivePublicFromPrivateRequest,
    getKeyInserts: (
      privateKeyRow: $ReadOnly<KeyRow>,
    ) => {
      newPrivateKey: KeyInsert | null,
      newPublicKey: KeyInsert | null,
    },
    initialDerivations: TreeInsert<any>,
  ): Promise<{
    publicDeriverResult: $ReadOnly<PublicDeriverRow>,
    levelResult: {
      KeyDerivation: $ReadOnly<KeyDerivationRow>,
      specificDerivationResult: $ReadOnly<Row>
    },
  }> {
    const derivationAndKey = await DerivePublicFromPrivate.depTables.GetKeyForPrivateDeriver.get(
      db, tx,
      bip44WrapperId,
      false,
      true,
    );

    if (derivationAndKey.privateKey == null) {
      throw new StaleStateError('DerivePublicFromPrivate::add privateKey');
    }
    const newKeys = getKeyInserts(
      derivationAndKey.privateKey,
    );

    let pubDeriver;
    {
      // get parent of the new derivation
      if (body.pathToPublic.length === 0) {
        throw new Error('DerivePublicFromPrivate::add invalid pathToPublic length');
      }
      let parentId = derivationAndKey.PrivateDeriver.KeyDerivationId;
      for (let i = 0; i < body.pathToPublic.length - 1; i++) {
        const nextLevel = await DerivePublicFromPrivate.depTables.GetOrAddDerivation.getOrAdd(
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
          derivationAndKey.PrivateDeriver.Level + i + 1,
        );
        parentId = nextLevel.KeyDerivation.KeyDerivationId;
      }
      pubDeriver = await DerivePublicFromPrivate.depTables.AddPublicDeriver.add(
        db, tx,
        {
          wrapperId: bip44WrapperId,
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
          level: derivationAndKey.PrivateDeriver.Level + body.pathToPublic.length,
          addPublicDeriverRequest: body.publicDeriverInsert
        }
      );
    }
    await DerivePublicFromPrivate.depTables.AddTree.add(
      db, tx,
      {
        derivationId: pubDeriver.publicDeriverResult.KeyDerivationId,
        children: initialDerivations,
      },
      derivationAndKey.PrivateDeriver.Level + body.pathToPublic.length,
    );

    return pubDeriver;
  }
}

export class ModifyDisplayCutoff {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44ChainSchema.name]: Bip44Tables.Bip44ChainSchema,
    [Bip44Tables.Bip44AddressSchema.name]: Bip44Tables.Bip44AddressSchema,
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetPathWithSpecific,
    GetChildWithSpecific,
  });

  static async pop(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      pubDeriverKeyDerivationId: number,
      pathToLevel: Array<number>,
    },
  ): Promise<void | {
    index: number,
    row: $ReadOnly<Bip44AddressRow>,
  }> {
    const path = await ModifyDisplayCutoff.depTables.GetPathWithSpecific.getPath<Bip44ChainRow>(
      db, tx,
      {
        ...request,
        level: DerivationLevels.CHAIN.level,
      }
    );
    const oldChain = path.levelSpecific;

    if (oldChain.DisplayCutoff === null) {
      throw new Error('DisplayCutoffRequest::pop should DisplayCutoff==null');
    }

    const newIndex = oldChain.DisplayCutoff + 1;

    // Get the address at this new index

    const address = await ModifyDisplayCutoff.depTables.GetChildWithSpecific.get<Bip44AddressRow>(
      db, tx,
      DerivationLevels.ADDRESS.level,
      oldChain.KeyDerivationId,
      newIndex,
    );

    // note: if the address doesn't exist, return right away
    // do NOT save to storage
    if (address === undefined) {
      return undefined;
    }

    // Update the external chain DisplayCutoff


    await ModifyDisplayCutoff.set(
      db, tx,
      {
        derivationId: oldChain.KeyDerivationId,
        newIndex
      },
    );

    return {
      index: newIndex,
      row: address.levelSpecific,
    };
  }

  static async set(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      derivationId: number,
      newIndex: number,
    },
  ): Promise<void> {
    const chainTable = db.getSchema().table(
      ModifyDisplayCutoff.ownTables[Bip44Tables.Bip44ChainSchema.name].name
    );
    const updateQuery = db
      .update(chainTable)
      .set(
        chainTable[Bip44Tables.Bip44ChainSchema.properties.DisplayCutoff],
        request.newIndex
      )
      .where(op.and(
        chainTable[Bip44Tables.Bip44ChainSchema.properties.KeyDerivationId].eq(
          request.derivationId
        ),
      ));

    await tx.attach(updateQuery);
  }
}

export type AddAdhocPublicDeriverRequest = {|
  bip44WrapperId: number,
  publicKey: KeyInsert,
  parentDerivationId: null | number,
  pathStartLevel: number,
  pathToPublic: InsertPath,
  publicDeriverInsert: {
    derivationId: number,
    wrapperId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
   initialDerivations: TreeInsert<any>,
  hwWalletMetaInsert?: HwWalletMetaInsert,
|}
export type AddAdhocPublicDeriverResponse<Row> = {|
  publicDeriver: AddPublicDeriverResponse<Row>,
  hwWalletMeta: void | $ReadOnly<HwWalletMetaRow>,
|}
export class AddAdhocPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
    AddPublicDeriver,
    ModifyHwWalletMeta,
    AddTree,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddAdhocPublicDeriverRequest,
  ): Promise<AddAdhocPublicDeriverResponse<Row>> {
    let parentId: number | null = request.parentDerivationId;
    for (let i = 0; i < request.pathToPublic.length - 1; i++) {
      const levelResult = await AddAdhocPublicDeriver.depTables.AddDerivation.add(
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
            Index: request.pathStartLevel + i === 0  ? null : request.pathToPublic[i].index,
          }),
          levelInfo: id => ({
            KeyDerivationId: id,
            ...request.pathToPublic[i].insert,
          }),
        },
        request.pathStartLevel + i,
      );
      parentId = levelResult.KeyDerivation.KeyDerivationId;
    }

    const publicDeriver = await AddAdhocPublicDeriver.depTables.AddPublicDeriver.add(
      db, tx,
      {
        wrapperId: request.bip44WrapperId,
        addLevelRequest: {
          privateKeyInfo: null,
          publicKeyInfo: request.publicKey,
          derivationInfo: keys => ({
            PublicKeyId: keys.public,
            PrivateKeyId: keys.private,
            Parent: parentId,
            Index: request.pathToPublic[request.pathToPublic.length - 1].index,
          }),
          levelInfo: id => ({
            KeyDerivationId: id,
            ...request.pathToPublic[request.pathToPublic.length - 1].insert,
          }),
        },
        level: request.pathStartLevel + request.pathToPublic.length - 1,
        addPublicDeriverRequest: request.publicDeriverInsert
      }
    );

    await AddAdhocPublicDeriver.depTables.AddTree.add(
      db, tx,
      {
        derivationId: publicDeriver.publicDeriverResult.KeyDerivationId,
        children: request.initialDerivations,
      },
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
