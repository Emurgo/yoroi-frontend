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

import type { KeyInsert, } from '../../uncategorized/tables';
import { AddKey, } from '../../uncategorized/api/add';

import {
  allDerivationTables,
  DerivationLevels,
  TableMap,
} from './utils';
import { addToTable, } from '../../utils';

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
    [Bip44Tables.Bip44DerivationSchema.name]: (Bip44Tables.Bip44DerivationSchema.name: string),
  });
  static depTables = Object.freeze({
    AddKey,
  });

  static async func<Insert, Row>(
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
      throw new Error('AddDerivation::func Unknown table queried');
    }

    const privateKey = request.privateKeyInfo === null
      ? null
      : await AddKey.func(
        db, tx,
        request.privateKeyInfo,
      );
    const publicKey = request.publicKeyInfo === null
      ? null
      : await AddKey.func(
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
        AddDerivation.ownTables[Bip44Tables.Bip44DerivationSchema.name],
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
      Bip44Tables.Bip44DerivationMappingSchema.name: string
    ),
  });
  static depTables = Object.freeze({
    AddDerivation,
  });

  static async func<Insert, Row>(
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
      throw new Error('AddDerivationWithParent::func Root has no parent');
    }
    const derivationResult = await AddDerivation.func<Insert, Row>(
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

export type PrivateDeriverRequest<Insert> = {
  addLevelRequest: AddDerivationRequest<Insert>,
  level: number,
  addPrivateDeriverRequest: number => PrivateDeriverInsert,
};
export class AddPrivateDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PrivateDeriverSchema.name]: (Bip44Tables.PrivateDeriverSchema.name: string),
  });
  static depTables = Object.freeze({
    AddDerivation,
  });

  static async func<Insert, Row>(
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
    const levelResult = await AddDerivation.func(
      db, tx,
      request.addLevelRequest,
      request.level,
    );
    const privateDeriverResult = await addToTable<PrivateDeriverInsert, PrivateDeriverRow>(
      db, tx,
      request.addPrivateDeriverRequest(levelResult.derivationTableResult.Bip44DerivationId),
      AddPrivateDeriver.ownTables[Bip44Tables.PrivateDeriverSchema.name],
    );
    return {
      privateDeriverResult,
      levelResult,
    };
  }
}

export class AddBip44Wrapper {
  static ownTables = Object.freeze({
    [Bip44Tables.Bip44WrapperSchema.name]: Bip44Tables.Bip44WrapperSchema.name,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    request: Bip44WrapperInsert,
  ): Promise<Bip44WrapperRow> {
    return await addToTable<Bip44WrapperInsert, Bip44WrapperRow>(
      db, tx,
      request,
      AddBip44Wrapper.ownTables[Bip44Tables.Bip44WrapperSchema.name],
    );
  }
}

/** TODO: is more complicated than this */
export class AddPublicDeriver {
  static ownTables = Object.freeze({
    [Bip44Tables.PublicDeriverSchema.name]: Bip44Tables.PublicDeriverSchema.name,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    request: PublicDeriverInsert,
  ): Promise<PublicDeriverRow> {
    return await addToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request,
      AddPublicDeriver.ownTables[Bip44Tables.PublicDeriverSchema.name],
    );
  }
}
