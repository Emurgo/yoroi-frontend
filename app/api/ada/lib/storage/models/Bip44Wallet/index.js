// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import {
  ConceptualWallet, refreshConceptualWalletFunctionality,
} from '../ConceptualWallet';
import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';

import {
  Mixin,
} from 'mixwith';

import type {
  IBip44Wallet,
  IDerivePublicFromPrivateRequest,
  IDerivePublicFromPrivateResponse,
  IDerivePublicFromPrivate,
  IGetPrivateDeriverKey, IGetPrivateDeriverKeyRequest, IGetPrivateDeriverKeyResponse,
  IAddAdhocPublicDeriverRequest, IAddAdhocPublicDeriverResponse,
  IAdhocPublicDeriver,
} from './interfaces';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
} from '../../database/utils';

import {
  DerivePublicFromPrivate, AddAdhocPublicDeriver,
} from '../../database/bip44/api/write';
import type {
  PrivateDeriverRow,
  Bip44WrapperRow,
} from '../../database/bip44/tables';
import {
  GetPrivateDeriver,
  GetKeyForPrivateDeriver
} from '../../database/bip44/api/read';
import type { KeyRow } from '../../database/primitives/tables';
import { UpdateGet, } from '../../database/primitives/api/write';

import {
  rawChangePassword,
  normalizeToPubDeriverLevel,
  toKeyInsert,
} from '../utils';

import type {
  IChangePasswordRequest, IChangePasswordResponse,
} from '../common/interfaces';

/** Snapshot of a Bip44Wallet in the database */
export class Bip44Wallet extends ConceptualWallet implements IBip44Wallet {
  /**
   * Should only cache information we know will never change
   */

  #bip44WrapperId: number;
  #publicDeriverLevel: number;
  #signingLevel: number | null;
  #privateDeriverLevel: number | null;
  #version: number;
  #protocolMagic: number;

  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Bip44WrapperRow>,
    privateDeriverLevel: number | null,
    protocolMagic: number,
  ): Bip44Wallet {
    super(conceptualWalletCtorData);
    this.#bip44WrapperId = row.Bip44WrapperId;
    this.#publicDeriverLevel = row.PublicDeriverLevel;
    this.#version = row.Version;
    this.#signingLevel = row.SignerLevel;
    this.#privateDeriverLevel = privateDeriverLevel;
    this.#protocolMagic = protocolMagic;
    return this;
  }

  getDb(): lf$Database {
    return this.db;
  }

  getWrapperId(): number {
    return this.#bip44WrapperId;
  }

  getPublicDeriverLevel(): number {
    return this.#publicDeriverLevel;
  }

  getSigningLevel(): number | null {
    return this.#signingLevel;
  }

  getPrivateDeriverLevel(): number | null {
    return this.#privateDeriverLevel;
  }

  getVersion(): number {
    return this.#version;
  }

  getProtocolMagic(): number {
    return this.#protocolMagic;
  }

  static async createBip44Wallet(
    db: lf$Database,
    row: $ReadOnly<Bip44WrapperRow>,
    protocolMagic: number,
  ): Promise<Bip44Wallet> {
    return await refreshBip44WalletFunctionality(
      db,
      row,
      protocolMagic
    );
  }
}

export async function refreshBip44WalletFunctionality(
  db: lf$Database,
  row: $ReadOnly<Bip44WrapperRow>,
  protocolMagic: number, // TODO: should be stored in a table somewhere in the future
): Promise<IBip44Wallet> {
  const conceptualWalletCtorData = await refreshConceptualWalletFunctionality(
    db,
    row.ConceptualWalletId,
  );

  let privateDeriverLevel = null;

  let currClass = Bip44Wallet;

  let privateDeriverRow;
  {
    const deps = Object.freeze({
      GetPrivateDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(db, table));
    privateDeriverRow = await raii<void | $ReadOnly<PrivateDeriverRow>>(
      db,
      depTables,
      async tx => {
        const privateDeriver = await deps.GetPrivateDeriver.fromBip44Wrapper(
          db, tx,
          row.Bip44WrapperId,
        );

        return privateDeriver;
      }
    );
  }

  if (privateDeriverRow !== undefined) {
    currClass = PublicFromPrivate(currClass);
    currClass = GetPrivateDeriverKey(currClass);
    privateDeriverLevel = privateDeriverRow.Level;
  } else {
    currClass = AdhocPublicDeriver(currClass);
  }

  const instance = new currClass(
    db,
    conceptualWalletCtorData,
    row,
    privateDeriverLevel,
    protocolMagic,
  );
  return instance;
}

// ===========================
//   DerivePublicFromPrivate
// ===========================

export async function derivePublicDeriver<Row>(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| DerivePublicFromPrivate: Class<DerivePublicFromPrivate> |},
  bip44WrapperId: number,
  version: number,
  body: IDerivePublicFromPrivateRequest,
): Promise<IDerivePublicFromPrivateResponse<Row>> {
  const result = await deps.DerivePublicFromPrivate.add<Row>(
    db, tx,
    bip44WrapperId,
    {
      publicDeriverInsert: body.publicDeriverInsert,
      pathToPublic: body.pathToPublic,
    },
    (privateKeyRow: $ReadOnly<KeyRow>) => {
      const newKeys = normalizeToPubDeriverLevel({
        privateKeyRow,
        password: body.decryptPrivateDeriverPassword,
        path: body.pathToPublic.map(step => step.index),
        version
      });

      const newPrivateKey = body.publicDeriverPrivateKey
        ? toKeyInsert(
          body.publicDeriverPrivateKey,
          newKeys.prvKeyHex,
        )
        : null;
      const newPublicKey = body.publicDeriverPublicKey
        ? toKeyInsert(
          body.publicDeriverPublicKey,
          newKeys.pubKeyHex,
        )
        : null;

      return {
        newPrivateKey,
        newPublicKey,
      };
    },
    body.initialDerivations,
  );

  return result;
}

type PublicFromPrivateDependencies = IBip44Wallet;
const PublicFromPrivateMixin = (
  superclass: Class<PublicFromPrivateDependencies>
) => class PublicFromPrivate extends superclass implements IDerivePublicFromPrivate {

  rawDerivePublicDeriverFromPrivate = async <Row>(
    tx: lf$Transaction,
    deps: {| DerivePublicFromPrivate: Class<DerivePublicFromPrivate> |},
    body: IDerivePublicFromPrivateRequest,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    return await derivePublicDeriver<Row>(
      super.getDb(),
      tx,
      { DerivePublicFromPrivate: deps.DerivePublicFromPrivate },
      super.getWrapperId(),
      super.getVersion(),
      body,
    );
  }
  derivePublicDeriverFromPrivate = async <Row>(
    body: IDerivePublicFromPrivateRequest,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    const deps = Object.freeze({
      DerivePublicFromPrivate,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawDerivePublicDeriverFromPrivate<Row>(tx, deps, body)
    );
  }
};
const PublicFromPrivate = Mixin<
  PublicFromPrivateDependencies,
  IDerivePublicFromPrivate,
>(PublicFromPrivateMixin);
const PublicFromPrivateInstance = (
  (PublicFromPrivate: any): ReturnType<typeof PublicFromPrivateMixin>
);
export function asPublicFromPrivate<T: IBip44Wallet>(
  obj: T
): void | (IDerivePublicFromPrivate & PublicFromPrivateDependencies & T) {
  if (obj instanceof PublicFromPrivateInstance) {
    return obj;
  }
  return undefined;
}

// ========================
//   GetPrivateDeriverKey
// ========================

type GetPrivateDeriverKeyDependencies = IBip44Wallet;
const GetPrivateDeriverKeyMixin = (
  superclass: Class<GetPrivateDeriverKeyDependencies>
) => class GetPrivateDeriverKey extends superclass implements IGetPrivateDeriverKey {

  rawGetPrivateDeriverKey = async (
    tx: lf$Transaction,
    deps: {| GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver> |},
    _body: IGetPrivateDeriverKeyRequest,
  ): Promise<IGetPrivateDeriverKeyResponse> => {
    const result = await deps.GetKeyForPrivateDeriver.get(
      super.getDb(), tx,
      super.getWrapperId(),
      false,
      true,
    );

    if (result.privateKey == null) {
      throw new StaleStateError('GetPrivateDeriverKey::getPrivateDeriverKey privateKey=null');
    }
    return {
      keyRow: result.privateKey,
      keyDerivation: result.KeyDerivation,
    };
  }
  getPrivateDeriverKey = async (
    body: IGetPrivateDeriverKeyRequest,
  ): Promise<IGetPrivateDeriverKeyResponse> => {
    const deps = Object.freeze({
      GetKeyForPrivateDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetPrivateDeriverKeyResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawGetPrivateDeriverKey(tx, deps, body)
    );
  }

  rawChangePrivateDeriverPassword = async (
    tx: lf$Transaction,
    deps: {|
      GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver>,
      UpdateGet: Class<UpdateGet>,
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetPrivateDeriverKey(
      tx,
      { GetKeyForPrivateDeriver: deps.GetKeyForPrivateDeriver },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: deps.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow.keyRow
      },
    );
  }
  changePrivateDeriverPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const deps = Object.freeze({
      GetKeyForPrivateDeriver,
      UpdateGet
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawChangePrivateDeriverPassword(tx, deps, body)
    );
  }
};

const GetPrivateDeriverKey = Mixin<
  GetPrivateDeriverKeyDependencies,
  IGetPrivateDeriverKey,
>(GetPrivateDeriverKeyMixin);
const GetPrivateDeriverKeyInstance = (
  (GetPrivateDeriverKey: any): ReturnType<typeof GetPrivateDeriverKeyMixin>
);
export function asGetPrivateDeriverKey<T: IBip44Wallet>(
  obj: T
): void | (IGetPrivateDeriverKey & GetPrivateDeriverKeyDependencies & T) {
  if (obj instanceof GetPrivateDeriverKeyInstance) {
    return obj;
  }
  return undefined;
}

// ======================
//   AdhocPublicDeriver
// ======================

type AdhocPublicDeriverDepenencies = IBip44Wallet;
const AdhocPublicDeriverMixin = (
  superclass: Class<AdhocPublicDeriverDepenencies>
) => class AdhocPublicDeriver extends superclass implements IAdhocPublicDeriver {

  rawAddAdhocPubicDeriver = async <Row>(
    tx: lf$Transaction,
    deps: {| AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver> |},
    body: IAddAdhocPublicDeriverRequest,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    return await deps.AddAdhocPublicDeriver.add<Row>(
      super.getDb(), tx,
      body,
    );
  }
  addAdhocPubicDeriver = async <Row>(
    body: IAddAdhocPublicDeriverRequest,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    const deps = Object.freeze({
      AddAdhocPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawAddAdhocPubicDeriver<Row>(tx, deps, body)
    );
  }
};
const AdhocPublicDeriver = Mixin<
  AdhocPublicDeriverDepenencies,
  IAdhocPublicDeriver,
>(AdhocPublicDeriverMixin);
const AdhocPublicDeriverInstance = (
  (AdhocPublicDeriver: any): ReturnType<typeof AdhocPublicDeriverMixin>
);
export function asAdhocPublicDeriver<T: IBip44Wallet>(
  obj: T
): void | (IAdhocPublicDeriver & AdhocPublicDeriverDepenencies & T) {
  if (obj instanceof AdhocPublicDeriverInstance) {
    return obj;
  }
  return undefined;
}
