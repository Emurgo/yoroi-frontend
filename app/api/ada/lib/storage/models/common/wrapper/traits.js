
// @flow


import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import {
  ConceptualWallet, refreshConceptualWalletFunctionality,
} from '../../ConceptualWallet/index';
import type {
  IConceptualWallet,
  IConceptualWalletConstructor,
} from '../../ConceptualWallet/interfaces';

import {
  Mixin,
} from 'mixwith';

import { encryptWithPassword } from '../../../../../../../utils/passwordCipher';

import type {
  IPrivateDeriver,
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
  mapToTables,
  StaleStateError,
} from '../../../database/utils';

import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../../database/walletTypes/common/api/write';
import { UpdateGet, } from '../../../database/primitives/api/write';
import { GetKeyForDerivation, } from '../../../database/primitives/api/read';

import {
  rawChangePassword,
  normalizeBip32Ed25519ToPubDeriverLevel,
} from '../../utils';

import type {
  IChangePasswordRequest, IChangePasswordResponse,
} from '../interfaces';

// ===========================
//   DerivePublicFromPrivate
// ===========================

export async function derivePublicDeriver<Row>(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| DerivePublicDeriverFromKey: Class<DerivePublicDeriverFromKey> |},
  conceptualWalletId: number,
  body: IDerivePublicFromPrivateRequest,
  privateDeriverKeyDerivationId: number,
  privateDeriverLevel: number,
  derivationTables: Map<number, string>,
): Promise<IDerivePublicFromPrivateResponse<Row>> {
  return await deps.DerivePublicDeriverFromKey.add<{}, Row>(
    db, tx,
    {
      publicDeriverMeta: body.publicDeriverMeta,
      pathToPublic: privateKeyRow => {
        const accountKey = normalizeBip32Ed25519ToPubDeriverLevel({
          privateKeyRow,
          password: body.decryptPrivateDeriverPassword,
          path: body.path,
        });
        return [
          ...body.path.slice(0, body.path.length - 1).map(index => ({
            index,
            insert: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
            }),
            privateKey: null,
            publicKey: null,
          })),
          {
            index: body.path[body.path.length - 1],
            insert: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
            }),
            privateKey: body.encryptPublicDeriverPassword === undefined
              ? null
              : {
                Hash: body.encryptPublicDeriverPassword === null
                  ? accountKey.prvKeyHex
                  : encryptWithPassword(
                    body.encryptPublicDeriverPassword,
                    Buffer.from(accountKey.prvKeyHex, 'hex')
                  ),
                IsEncrypted: true,
                PasswordLastUpdate: null,
              },
            publicKey: {
              Hash: accountKey.pubKeyHex,
              IsEncrypted: false,
              PasswordLastUpdate: null,
            },
          },
        ];
      },
      initialDerivations: body.initialDerivations,
    },
    privateDeriverKeyDerivationId,
    privateDeriverLevel,
    conceptualWalletId,
    derivationTables,
  );
}

type PublicFromPrivateDependencies = IPrivateDeriver & IConceptualWallet;
const PublicFromPrivateMixin = (
  superclass: Class<PublicFromPrivateDependencies>
) => class PublicFromPrivate extends superclass implements IDerivePublicFromPrivate {

  rawDerivePublicDeriverFromPrivate = async <Row>(
    tx: lf$Transaction,
    deps: {| DerivePublicDeriverFromKey: Class<DerivePublicDeriverFromKey> |},
    body: IDerivePublicFromPrivateRequest,
    derivationTables: Map<number, string>,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    const id = super.getPrivateDeriverKeyDerivationId();
    const level = super.getPrivateDeriverLevel();
    if (id == null || level == null) {
      throw new StaleStateError('rawDerivePublicDeriverFromPrivate no private deriver');
    }
    return await derivePublicDeriver<Row>(
      super.getDb(),
      tx,
      { DerivePublicDeriverFromKey: deps.DerivePublicDeriverFromKey },
      super.getConceptualWalletId(),
      body,
      id,
      level,
      derivationTables,
    );
  }
  derivePublicDeriverFromPrivate = async <Row>(
    body: IDerivePublicFromPrivateRequest,
  ): Promise<IDerivePublicFromPrivateResponse<Row>> => {
    const derivationTables = this.getDerivationTables();
    const deps = Object.freeze({
      DerivePublicDeriverFromKey,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawDerivePublicDeriverFromPrivate<Row>(
        tx, deps, body, derivationTables
      )
    );
  }
};
export const PublicFromPrivate = Mixin<
  PublicFromPrivateDependencies,
  IDerivePublicFromPrivate,
>(PublicFromPrivateMixin);
const PublicFromPrivateInstance = (
  (PublicFromPrivate: any): ReturnType<typeof PublicFromPrivateMixin>
);
export function asPublicFromPrivate<T: IPrivateDeriver>(
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

type GetPrivateDeriverKeyDependencies = IPrivateDeriver & IConceptualWallet;
const GetPrivateDeriverKeyMixin = (
  superclass: Class<GetPrivateDeriverKeyDependencies>
) => class GetPrivateDeriverKey extends superclass implements IGetPrivateDeriverKey {

  rawGetPrivateDeriverKey = async (
    tx: lf$Transaction,
    deps: {| GetKeyForDerivation: Class<GetKeyForDerivation> |},
    _body: IGetPrivateDeriverKeyRequest,
  ): Promise<IGetPrivateDeriverKeyResponse> => {
    const derivationId = super.getPrivateDeriverKeyDerivationId();
    if (derivationId == null) {
      throw new StaleStateError('GetPrivateDeriverKey::getPrivateDeriverKey derivationId=null');
    }
    const result = await deps.GetKeyForDerivation.get(
      super.getDb(), tx,
      derivationId,
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
      GetKeyForDerivation,
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
      GetKeyForDerivation: Class<GetKeyForDerivation>,
      UpdateGet: Class<UpdateGet>,
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetPrivateDeriverKey(
      tx,
      { GetKeyForDerivation: deps.GetKeyForDerivation },
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
      GetKeyForDerivation,
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

export const GetPrivateDeriverKey = Mixin<
  GetPrivateDeriverKeyDependencies,
  IGetPrivateDeriverKey,
>(GetPrivateDeriverKeyMixin);
const GetPrivateDeriverKeyInstance = (
  (GetPrivateDeriverKey: any): ReturnType<typeof GetPrivateDeriverKeyMixin>
);
export function asGetPrivateDeriverKey<T: IPrivateDeriver>(
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

type AdhocPublicDeriverDepenencies = IConceptualWallet;
const AdhocPublicDeriverMixin = (
  superclass: Class<AdhocPublicDeriverDepenencies>
) => class AdhocPublicDeriver extends superclass implements IAdhocPublicDeriver {

  rawAddAdhocPubicDeriver = async <Row>(
    tx: lf$Transaction,
    deps: {| AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver> |},
    body: IAddAdhocPublicDeriverRequest<any>,
    derivationTables: Map<number, string>,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    return await deps.AddAdhocPublicDeriver.add<any, Row>(
      super.getDb(), tx,
      body,
      super.getConceptualWalletId(),
      derivationTables,
    );
  }
  addAdhocPubicDeriver = async <Row>(
    body: IAddAdhocPublicDeriverRequest<any>,
  ): Promise<IAddAdhocPublicDeriverResponse<Row>> => {
    const derivationTables = this.getDerivationTables();
    const deps = Object.freeze({
      AddAdhocPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawAddAdhocPubicDeriver<Row>(tx, deps, body, derivationTables)
    );
  }
};
export const AdhocPublicDeriver = Mixin<
  AdhocPublicDeriverDepenencies,
  IAdhocPublicDeriver,
>(AdhocPublicDeriverMixin);
const AdhocPublicDeriverInstance = (
  (AdhocPublicDeriver: any): ReturnType<typeof AdhocPublicDeriverMixin>
);
export function asAdhocPublicDeriver<T: IConceptualWallet>(
  obj: T
): void | (IAdhocPublicDeriver & AdhocPublicDeriverDepenencies & T) {
  if (obj instanceof AdhocPublicDeriverInstance) {
    return obj;
  }
  return undefined;
}
