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
import type { KeyRow } from '../../database/uncategorized/tables';
import { UpdateGet, } from '../../database/uncategorized/api/write';

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

  const privateDeriverRow = await raii<void | $ReadOnly<PrivateDeriverRow>>(
    db,
    [
      ...getAllSchemaTables(db, GetPrivateDeriver),
    ],
    async tx => {
      const privateDeriver = await GetPrivateDeriver.fromBip44Wrapper(
        db, tx,
        row.Bip44WrapperId,
      );

      return privateDeriver;
    }
  );
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
  depTables: {| DerivePublicFromPrivate: Class<DerivePublicFromPrivate> |},
  bip44WrapperId: number,
  version: number,
  body: IDerivePublicFromPrivateRequest,
): Promise<IDerivePublicFromPrivateResponse<Row>> {
  const result = await depTables.DerivePublicFromPrivate.add<Row>(
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

const PublicFromPrivateMixin = (
  superclass: Class<IBip44Wallet>
) => class PublicFromPrivate extends superclass implements IDerivePublicFromPrivate {

  rawDerivePublicDeriverFromPrivate = async <Row>(
    tx: lf$Transaction,
    depTables: {| DerivePublicFromPrivate: Class<DerivePublicFromPrivate> |},
    body: IDerivePublicFromPrivateRequest,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    return await derivePublicDeriver<Row>(
      super.getDb(),
      tx,
      { DerivePublicFromPrivate },
      super.getWrapperId(),
      super.getVersion(),
      body,
    );
  }
  derivePublicDeriverFromPrivate = async <Row>(
    body: IDerivePublicFromPrivateRequest,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    return await raii(
      super.getDb(),
      getAllSchemaTables(super.getDb(), DerivePublicFromPrivate),
      async tx => this.rawDerivePublicDeriverFromPrivate<Row>(tx, { DerivePublicFromPrivate }, body)
    );
  }
};
type PublicFromPrivateClassType = ReturnType<typeof PublicFromPrivateMixin>;
const PublicFromPrivate = Mixin<
  IBip44Wallet,
  IDerivePublicFromPrivate,
>(PublicFromPrivateMixin);
export const PublicFromPrivateInstance = (
  (PublicFromPrivate: any): PublicFromPrivateClassType
);

// ========================
//   GetPrivateDeriverKey
// ========================

const GetPrivateDeriverKeyMixin = (
  superclass: Class<IBip44Wallet>
) => class GetPrivateDeriverKey extends superclass implements IGetPrivateDeriverKey {

  rawGetPrivateDeriverKey = async (
    tx: lf$Transaction,
    depTables: {| GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver> |},
    _body: IGetPrivateDeriverKeyRequest,
  ): Promise<IGetPrivateDeriverKeyResponse> => {
    const result = await depTables.GetKeyForPrivateDeriver.get(
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
    return await raii<IGetPrivateDeriverKeyResponse>(
      super.getDb(),
      getAllSchemaTables(super.getDb(), GetKeyForPrivateDeriver),
      async tx => this.rawGetPrivateDeriverKey(tx, { GetKeyForPrivateDeriver }, body)
    );
  }

  rawChangePrivateDeriverPassword = async (
    tx: lf$Transaction,
    depTables: {|
      GetKeyForPrivateDeriver: Class<GetKeyForPrivateDeriver>,
      UpdateGet: Class<UpdateGet>,
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetPrivateDeriverKey(
      tx,
      { GetKeyForPrivateDeriver: depTables.GetKeyForPrivateDeriver },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: depTables.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow.keyRow
      },
    );
  }
  changePrivateDeriverPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetKeyForPrivateDeriver),
        ...getAllSchemaTables(super.getDb(), UpdateGet),
      ],
      async tx => this.rawChangePrivateDeriverPassword(
        tx,
        { GetKeyForPrivateDeriver, UpdateGet },
        body
      )
    );
  }
};

type GetPrivateDeriverKeyClassType = ReturnType<typeof GetPrivateDeriverKeyMixin>;
const GetPrivateDeriverKey = Mixin<
  IBip44Wallet,
  IGetPrivateDeriverKey,
>(GetPrivateDeriverKeyMixin);
export const GetPrivateDeriverKeyInstance = (
  (GetPrivateDeriverKey: any): GetPrivateDeriverKeyClassType
);


// ======================
//   AdhocPublicDeriver
// ======================

const AdhocPublicDeriverMixin = (
  superclass: Class<IBip44Wallet>
) => class AdhocPublicDeriver extends superclass implements IAdhocPublicDeriver {

  rawAddAdhocPubicDeriver = async <Row>(
    tx: lf$Transaction,
    depTables: {| AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver> |},
    body: IAddAdhocPublicDeriverRequest,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    return await depTables.AddAdhocPublicDeriver.add<Row>(
      super.getDb(), tx,
      body,
    );
  }
  addAdhocPubicDeriver = async <Row>(
    body: IAddAdhocPublicDeriverRequest,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    return await raii(
      super.getDb(),
      getAllSchemaTables(super.getDb(), AddAdhocPublicDeriver),
      async tx => this.rawAddAdhocPubicDeriver<Row>(tx, { AddAdhocPublicDeriver }, body)
    );
  }
};
type AdhocPublicDeriverClassType = ReturnType<typeof AdhocPublicDeriverMixin>;
const AdhocPublicDeriver = Mixin<
  IBip44Wallet,
  IAdhocPublicDeriver,
>(AdhocPublicDeriverMixin);
export const AdhocPublicDeriverInstance = (
  (AdhocPublicDeriver: any): AdhocPublicDeriverClassType
);
