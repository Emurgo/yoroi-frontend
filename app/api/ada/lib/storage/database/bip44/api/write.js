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
  Bip44WrapperInsert, Bip44WrapperRow,
  Bip44ChainRow,
  Bip44AddressRow,
  Bip44ToPublicDeriverInsert, Bip44ToPublicDeriverRow,
} from '../tables';
import * as Bip44Tables from '../tables';
import {
  GetBip44DerivationSpecific,
  GetKeyForPrivateDeriver,
  GetAllBip44Wallets,
} from './read';

import type {
  KeyDerivationRow,
  KeyInsert, KeyRow
} from '../../primitives/tables';
import { KeyDerivationSchema } from '../../primitives/tables';
import { AddDerivation, GetOrAddDerivation, } from '../../primitives/api/write';
import {
  GetChildWithSpecific, GetPathWithSpecific,
} from '../../primitives/api/read';

import {
  allBip44DerivationTables,
  Bip44TableMap,
  Bip44DerivationLevels,
} from './utils';
import { addNewRowToTable, StaleStateError, } from '../../utils';
import { AddPublicDeriver, ModifyHwWalletMeta } from '../../wallet/api/write';
import type {
  PublicDeriverInsert, PublicDeriverRow,
  HwWalletMetaInsert, HwWalletMetaRow,
} from '../../wallet/tables';
import { PublicDeriverSchema } from '../../wallet/tables';
import type { AddDerivationRequest } from '../../primitives/api/write';
import type { AddPublicDeriverResponse } from '../../wallet/api/write';

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

export class AddBip44Tree {
  static ownTables = Object.freeze({
    ...allBip44DerivationTables,
  });
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
      const tableName = Bip44TableMap.get(level + 1);
      if (tableName == null) {
        throw new Error('AddDerivation::add Unknown table queried');
      }
      const result = await AddBip44Tree.depTables.GetOrAddDerivation.getOrAdd(
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
      if (tree.children[i].children != null) {
        await AddBip44Tree.add(
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

export class AddBipp44ToPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44ToPublicDeriverSchema.name]: Bip44Tables.Bip44ToPublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44ToPublicDeriverInsert,
  ): Promise<$ReadOnly<Bip44ToPublicDeriverRow>> {
    return await addNewRowToTable<Bip44ToPublicDeriverInsert, Bip44ToPublicDeriverRow>(
      db, tx,
      request,
      AddBipp44ToPublicDeriver.ownTables[Bip44Tables.Bip44ToPublicDeriverSchema.name].name,
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
    ...allBip44DerivationTables,
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
      const tableName = Bip44TableMap.get(request.pathToPrivate.length);
      if (tableName == null) {
        throw new Error('AddDerivation::add Unknown table queried');
      }
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
        tableName,
      );
      parentId = levelResult.KeyDerivation.KeyDerivationId;
    }

    const tableName = Bip44TableMap.get(request.pathToPrivate.length);
    if (tableName == null) {
      throw new Error('AddDerivation::add Unknown table queried');
    }
    const levelResult = await AddPrivateDeriver.depTables.AddDerivation.add(
      db, tx,
      request.addLevelRequest(parentId),
      tableName,
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

export type DerivePublicFromPrivateRequest= {|
  publicDeriverInsert: {
    derivationId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
  /**
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   */
  pathToPublic: InsertPath,
|};
export class DerivePublicFromPrivate {
  static ownTables = Object.freeze({
    ...allBip44DerivationTables,
  });
  static depTables = Object.freeze({
    AddPublicDeriver,
    GetKeyForPrivateDeriver,
    GetOrAddDerivation,
    AddBip44Tree,
    AddBipp44ToPublicDeriver,
    GetAllBip44Wallets,
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
        const tableName = Bip44TableMap.get(derivationAndKey.PrivateDeriver.Level + i + 1);
        if (tableName == null) {
          throw new Error('AddDerivation::add Unknown table queried');
        }
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
          tableName,
        );
        parentId = nextLevel.KeyDerivation.KeyDerivationId;
      }
      const tableName = Bip44TableMap.get(
        derivationAndKey.PrivateDeriver.Level + body.pathToPublic.length
      );
      if (tableName == null) {
        throw new Error('AddDerivation::add Unknown table queried');
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
          levelSpecificTableName: tableName,
          addPublicDeriverRequest: body.publicDeriverInsert
        }
      );
    }

    // add new row in mapping table
    {
      const children = await DerivePublicFromPrivate.depTables.GetAllBip44Wallets.forBip44Wallet(
        db, tx,
        bip44WrapperId
      );
      await DerivePublicFromPrivate.depTables.AddBipp44ToPublicDeriver.add(
        db, tx,
        {
          Bip44WrapperId: bip44WrapperId,
          PublicDeriverId: pubDeriver.publicDeriverResult.PublicDeriverId,
          Index: children.length,
        }
      );
    }
    await DerivePublicFromPrivate.depTables.AddBip44Tree.add(
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
    GetBip44DerivationSpecific,
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
        level: Bip44DerivationLevels.CHAIN.level,
      },
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetBip44DerivationSpecific.get<
        Bip44ChainRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.CHAIN.level,
        );
        const chainDerivation = result[0];
        if (chainDerivation === undefined) {
          // we know this level exists since we fetched it in GetChildIfExists
          throw new Error('ModifyDisplayCutoff::get missing chain. Should never happen');
        }
        return chainDerivation;
      },
    );
    const oldChain = path.levelSpecific;

    if (oldChain.DisplayCutoff === null) {
      throw new Error('DisplayCutoffRequest::pop should DisplayCutoff==null');
    }

    const newIndex = oldChain.DisplayCutoff + 1;

    // Get the address at this new index

    const address = await ModifyDisplayCutoff.depTables.GetChildWithSpecific.get<Bip44AddressRow>(
      db, tx,
      async (derivationId) => {
        const result = await ModifyDisplayCutoff.depTables.GetBip44DerivationSpecific.get<
          Bip44AddressRow
        >(
          db, tx,
          [derivationId],
          Bip44DerivationLevels.ADDRESS.level,
        );
        const addressDerivation = result[0];
        if (addressDerivation === undefined) {
          // we know this level exists since we fetched it in GetChildIfExists
          throw new Error('ModifyDisplayCutoff::get missing address. Should never happen');
        }
        return addressDerivation;
      },
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
    ...allBip44DerivationTables,
    [PublicDeriverSchema.name]: PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
    AddPublicDeriver,
    ModifyHwWalletMeta,
    AddBip44Tree,
    AddBipp44ToPublicDeriver,
    GetAllBip44Wallets,
  });

  static async add<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddAdhocPublicDeriverRequest,
  ): Promise<AddAdhocPublicDeriverResponse<Row>> {
    let parentId: number | null = request.parentDerivationId;
    for (let i = 0; i < request.pathToPublic.length - 1; i++) {
      const tableName = Bip44TableMap.get(request.pathStartLevel + i);
      if (tableName == null) {
        throw new Error('AddDerivation::add Unknown table queried');
      }
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
        tableName,
      );
      parentId = levelResult.KeyDerivation.KeyDerivationId;
    }

    const tableName = Bip44TableMap.get(request.pathStartLevel + request.pathToPublic.length - 1);
    if (tableName == null) {
      throw new Error('AddDerivation::add Unknown table queried');
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
        levelSpecificTableName: tableName,
        addPublicDeriverRequest: request.publicDeriverInsert
      }
    );

    // add new row in mapping table
    {
      const children = await AddAdhocPublicDeriver.depTables.GetAllBip44Wallets.forBip44Wallet(
        db, tx,
        request.bip44WrapperId
      );
      await AddAdhocPublicDeriver.depTables.AddBipp44ToPublicDeriver.add(
        db, tx,
        {
          Bip44WrapperId: request.bip44WrapperId,
          PublicDeriverId: publicDeriver.publicDeriverResult.PublicDeriverId,
          Index: children.length,
        }
      );
    }

    await AddAdhocPublicDeriver.depTables.AddBip44Tree.add(
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
