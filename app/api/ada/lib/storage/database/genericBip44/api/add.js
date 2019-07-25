// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Bip44DerivationMappingInsert, Bip44DerivationMappingRow,
  Bip44DerivationInsert,
  Bip44DerivationRow,
  PrivateDeriverInsert, PrivateDeriverRow,
  PublicDeriverInsert, PublicDeriverRow,
  Bip44WrapperInsert, Bip44WrapperRow,
} from '../tables';
import * as Bip44Tables from '../tables';
import {
  GetPrivateDeriver,
  GetBip44Derivation,
  GetDerivationsByPath,
} from './get';

import type { KeyInsert, KeyRow } from '../../uncategorized/tables';
import { AddKey, } from '../../uncategorized/api/add';
import { GetKey, } from '../../uncategorized/api/get';


import {
  allDerivationTables,
  DerivationLevels,
  TableMap,
} from './utils';
import { addToTable, StaleStateError, } from '../../utils';

export type AddDerivationRequest<Insert> = {|
  privateKeyInfo: KeyInsert | null,
  publicKeyInfo: KeyInsert | null,
  derivationInfo: {|
      private: number | null,
      public: number | null,
    |} => Bip44DerivationInsert,
  levelInfo: number => Insert,
|};

export class AddDerivation {
  static ownTables = Object.freeze({
    ...allDerivationTables,
    [Bip44Tables.Bip44DerivationSchema.name]: Bip44Tables.Bip44DerivationSchema,
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
    derivationTableResult: Bip44DerivationRow,
    specificDerivationResult: Row,
  }> {
    const tableName = TableMap.get(level);
    if (tableName == null) {
      throw new Error('AddDerivation::add Unknown table queried');
    }

    const privateKey = request.privateKeyInfo === null
      ? null
      : await AddKey.add(
        db, tx,
        request.privateKeyInfo,
      );
    const publicKey = request.publicKeyInfo === null
      ? null
      : await AddKey.add(
        db, tx,
        request.publicKeyInfo,
      );

    const derivationTableResult =
      await addToTable<Bip44DerivationInsert, Bip44DerivationRow>(
        db, tx,
        request.derivationInfo({
          private: privateKey ? privateKey.KeyId : null,
          public: publicKey ? publicKey.KeyId : null,
        }),
        AddDerivation.ownTables[Bip44Tables.Bip44DerivationSchema.name].name,
      );

    const specificDerivationResult =
      await addToTable<Insert, Row>(
        db,
        tx,
        request.levelInfo(derivationTableResult.Bip44DerivationId),
        tableName,
      );

    return {
      derivationTableResult,
      specificDerivationResult,
    };
  }
}

export type DeriveFromRequest<T> = {|
  parentDerivationId: number,
  ...AddDerivationRequest<T>
|};
export class AddDerivationWithParent {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44DerivationMappingSchema.name]: (
      Bip44Tables.Bip44DerivationMappingSchema
    ),
  });
  static depTables = Object.freeze({
    AddDerivation,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: DeriveFromRequest<Insert>,
    level: number,
  ): Promise<{
    derivationTableResult: Bip44DerivationRow,
    mappingTableResult: Bip44DerivationMappingRow,
    specificDerivationResult: Row,
  }> {
    if (level === DerivationLevels.ROOT.level) {
      throw new Error('AddDerivationWithParent::add Root has no parent');
    }
    const derivationResult = await AddDerivation.add<Insert, Row>(
      db, tx,
      {
        privateKeyInfo: request.privateKeyInfo,
        publicKeyInfo: request.publicKeyInfo,
        derivationInfo: request.derivationInfo,
        levelInfo: request.levelInfo,
      },
      level,
    );

    const mappingInsert: Bip44DerivationMappingInsert = {
      Parent: request.parentDerivationId,
      Child: derivationResult.derivationTableResult.Bip44DerivationId,
    };

    const mappingTableResult =
      await addToTable<Bip44DerivationMappingInsert, Bip44DerivationMappingRow>(
        db,
        tx,
        mappingInsert,
        Bip44Tables.Bip44DerivationMappingSchema.name,
      );

    return {
      ...derivationResult,
      mappingTableResult,
    };
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
  addLevelRequest: AddDerivationRequest<Insert>,
  level: number,
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
      derivationTableResult: Bip44DerivationRow,
      specificDerivationResult: Row
    },
  }> {
    const levelResult = await AddDerivation.add(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const privateDeriverResult = await addToTable<PrivateDeriverInsert, PrivateDeriverRow>(
      db, tx,
      request.addPrivateDeriverRequest(levelResult.derivationTableResult.Bip44DerivationId),
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
  addPrivateDeriverRequest: number => PublicDeriverInsert,
};
export class AddPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    /** depending on the case, we may have to either
     * derive with a parent or derive ad-hoc.
     * Since we can't know ahead of time, we set both as dependencies. */
    AddDerivation,
    AddDerivationWithParent,
  });

  static async adHoc<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      addLevelRequest: AddDerivationRequest<Insert>,
      level: number,
      addPublicDeriverRequest: number => PublicDeriverInsert,
    },
  ): Promise<{
    publcDeriverResult: PublicDeriverRow,
    levelResult: {
      derivationTableResult: Bip44DerivationRow,
      specificDerivationResult: Row
    },
  }> {
    const levelResult = await AddDerivation.add<Insert, Row>(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const publcDeriverResult = await addToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request.addPublicDeriverRequest(levelResult.derivationTableResult.Bip44DerivationId),
      AddPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name,
    );
    return {
      publcDeriverResult,
      levelResult,
    };
  }

  static async fromParent<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      addLevelRequest: DeriveFromRequest<Insert>,
      level: number,
      addPublicDeriverRequest: number => PublicDeriverInsert,
    },
  ): Promise<{
    publcDeriverResult: PublicDeriverRow,
    levelResult: {
      derivationTableResult: Bip44DerivationRow,
      mappingTableResult: Bip44DerivationMappingRow,
      specificDerivationResult: Row
    },
  }> {
    const levelResult = await AddDerivationWithParent.add<Insert, Row>(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const publcDeriverResult = await addToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request.addPublicDeriverRequest(levelResult.derivationTableResult.Bip44DerivationId),
      AddPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name].name,
    );
    return {
      publcDeriverResult,
      levelResult,
    };
  }
}

export type DerivePublicFromPrivateRequest = {|
  publicDeriverInsert: number => PublicDeriverInsert,
  /**
   * Path is relative to private deriver
   * Last index should be the index you want for the public deriver
   */
  pathToPublic: Array<number>,
|};
export class DerivePublicFromPrivate {
  static ownTables = Object.freeze({});
  static depTables = Object.freeze({
    AddPublicDeriver,
    GetPrivateDeriver,
    GetBip44Derivation,
    GetKey,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    bip44WrapperId: number,
    body: DerivePublicFromPrivateRequest,
    levelSpecificInsert: Insert,
    getKeyInserts: (
      privateKeyRow: KeyRow,
    ) => {
      newPrivateKey: KeyInsert | null,
      newPublicKey: KeyInsert | null,
    }
  ): Promise<{
    publcDeriverResult: PublicDeriverRow,
    levelResult: {
      derivationTableResult: Bip44DerivationRow,
      mappingTableResult: Bip44DerivationMappingRow,
      specificDerivationResult: Row
    },
  }> {
    let privateDeriverRow: PrivateDeriverRow;
    {
      // Get Private Deriver
      const result = await GetPrivateDeriver.fromBip44Wrapper(
        db, tx,
        bip44WrapperId,
      );
      if (result === undefined) {
        throw new StaleStateError('LovefieldDerive::_derive privateDeriver');
      }
      privateDeriverRow = result;
    }

    let privateKeyId: number;
    {
      // Private Deriver => Bip44Derivation
      const result = await GetBip44Derivation.get(
        db, tx,
        privateDeriverRow.Bip44DerivationId,
      );
      if (result === undefined) {
        throw new StaleStateError('LovefieldDerive::_derive Bip44DerivationTable');
      }
      if (result.PrivateKeyId === null) {
        throw new StaleStateError('LovefieldDerive::_derive PrivateKeyId');
      }
      privateKeyId = result.PrivateKeyId;
    }

    let privateKeyRow: KeyRow;
    {
      // Bip44Derivation => Private key
      const result = await GetKey.get(
        db, tx,
        privateKeyId,
      );
      if (result === undefined) {
        throw new StaleStateError('LovefieldDerive::_derive KeyTable');
      }
      privateKeyRow = result;
    }

    const newKeys = getKeyInserts(
      privateKeyRow,
    );

    let pubDeriver;
    {
      // get parent of the new derivation
      const newLevelParent = await GetDerivationsByPath.get(
        db, tx,
        privateDeriverRow.Bip44DerivationId,
        [],
        Array.from(body.pathToPublic.slice(0, body.pathToPublic.length - 1)),
      );
      const parentDerivationId = newLevelParent.keys().next().value;
      if (parentDerivationId === undefined) {
        throw new StaleStateError('LovefieldDerive::_derive newLevelParent');
      }

      pubDeriver = await AddPublicDeriver.fromParent(
        db, tx,
        {
          addLevelRequest: {
            privateKeyInfo: newKeys.newPrivateKey,
            publicKeyInfo: newKeys.newPublicKey,
            derivationInfo: keys => ({
              PublicKeyId: keys.public,
              PrivateKeyId: keys.private,
              Index: body.pathToPublic[body.pathToPublic.length - 1],
            }),
            parentDerivationId,
            levelInfo: id => ({
              Bip44DerivationId: id,
              ...levelSpecificInsert,
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
