// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  IConceptualWallet,
  IConceptualWalletConstructor,
  IHasPrivateDeriver,
  IHasLevels,
  IHasSign,
  IDerivePublicFromPrivateRequest,
  IDerivePublicFromPrivateResponse,
  IDerivePublicFromPrivate,
  IGetPrivateDeriverKey, IGetPrivateDeriverKeyRequest, IGetPrivateDeriverKeyResponse,
  IAddAdhocPublicDeriverRequest, IAddAdhocPublicDeriverResponse,
  IAdhocPublicDeriver,
} from './interfaces';
import { WalletTypeOption, } from './interfaces';
import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import type { IBip44Wallet } from '../Bip44Wallet/interfaces';
import type { ICip1852Wallet } from '../Cip1852Wallet/interfaces';
import type { Cip1852WrapperRow } from '../../database/walletTypes/cip1852/tables';
import {
  getAllSchemaTables,
  raii,
  mapToTables,
  StaleStateError,
} from '../../database/utils';
import type { HwWalletMetaRow, } from '../../database/walletTypes/core/tables';
import { GetHwWalletMeta } from '../../database/walletTypes/core/api/read';

import {
  Mixin,
} from 'mixwith';

import { encryptWithPassword } from '../../../../../../utils/passwordCipher';

import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../database/walletTypes/common/api/write';
import { UpdateGet, } from '../../database/primitives/api/write';
import { GetKeyForDerivation, } from '../../database/primitives/api/read';

import {
  rawChangePassword,
  normalizeBip32Ed25519ToPubDeriverLevel,
} from '../keyUtils';

import type {
  IChangePasswordRequest, IChangePasswordResponse,
} from '../common/interfaces';

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
  return await deps.DerivePublicDeriverFromKey.add<{...}, Row>(
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

type PublicFromPrivateDependencies = IHasPrivateDeriver & IHasLevels & IConceptualWallet;
const PublicFromPrivateMixin = (
  superclass: Class<PublicFromPrivateDependencies>
) => (class PublicFromPrivate extends superclass implements IDerivePublicFromPrivate {

  rawDerivePublicDeriverFromPrivate: <Row>(
    lf$Transaction,
    {| DerivePublicDeriverFromKey: Class<DerivePublicDeriverFromKey> |},
    IDerivePublicFromPrivateRequest,
    Map<number, string>,
    // eslint-disable-next-line no-unused-vars
  ) => Promise<IDerivePublicFromPrivateResponse<Row>> = async <Row>(
    tx,
    deps,
    body,
    derivationTables
  ) => {
    const id = super.getPrivateDeriverKeyDerivationId();
    const level = super.getPrivateDeriverLevel();
    if (id == null || level == null) {
      throw new StaleStateError('rawDerivePublicDeriverFromPrivate no private deriver');
    }
    const result = await derivePublicDeriver(
      super.getDb(),
      tx,
      { DerivePublicDeriverFromKey: deps.DerivePublicDeriverFromKey },
      super.getConceptualWalletId(),
      body,
      id,
      level,
      derivationTables,
    );
    return result;
  }
  derivePublicDeriverFromPrivate: <Row>(
    body: IDerivePublicFromPrivateRequest,
    // eslint-disable-next-line no-unused-vars
  ) => Promise<IDerivePublicFromPrivateResponse<Row>> = async <Row>(body) => {
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
      async tx => this.rawDerivePublicDeriverFromPrivate(
        tx, deps, body, derivationTables
      )
    );
  }
});
export const PublicFromPrivate = Mixin<
  PublicFromPrivateDependencies,
  IDerivePublicFromPrivate,
>(PublicFromPrivateMixin);
const PublicFromPrivateInstance = (
  (PublicFromPrivate: any): ReturnType<typeof PublicFromPrivateMixin>
);
export function asPublicFromPrivate<T: IHasPrivateDeriver>(
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

type GetPrivateDeriverKeyDependencies = IHasPrivateDeriver & IConceptualWallet;
const GetPrivateDeriverKeyMixin = (
  superclass: Class<GetPrivateDeriverKeyDependencies>
) => (class GetPrivateDeriverKey extends superclass implements IGetPrivateDeriverKey {

  rawGetPrivateDeriverKey: (
    lf$Transaction,
    {| GetKeyForDerivation: Class<GetKeyForDerivation> |},
    IGetPrivateDeriverKeyRequest,
  ) => Promise<IGetPrivateDeriverKeyResponse> = async (tx, deps, _body,) => {
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
  getPrivateDeriverKey: (
    IGetPrivateDeriverKeyRequest
  ) => Promise<IGetPrivateDeriverKeyResponse> = async (body) => {
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

  rawChangePrivateDeriverPassword: (
    lf$Transaction,
    {|
      GetKeyForDerivation: Class<GetKeyForDerivation>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest,
  ) => Promise<IChangePasswordResponse> = async (tx, deps, body) => {
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
  changePrivateDeriverPassword: IChangePasswordRequest => Promise<IChangePasswordResponse> = async (
    body,
  ) => {
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
});

export const GetPrivateDeriverKey = Mixin<
  GetPrivateDeriverKeyDependencies,
  IGetPrivateDeriverKey,
>(GetPrivateDeriverKeyMixin);
const GetPrivateDeriverKeyInstance = (
  (GetPrivateDeriverKey: any): ReturnType<typeof GetPrivateDeriverKeyMixin>
);
export function asGetPrivateDeriverKey<T: IHasPrivateDeriver>(
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

type AdhocPublicDeriverDepenencies = IHasLevels & IConceptualWallet;
const AdhocPublicDeriverMixin = (
  superclass: Class<AdhocPublicDeriverDepenencies>
) => (class AdhocPublicDeriver extends superclass implements IAdhocPublicDeriver {

  rawAddAdhocPubicDeriver: <Row>(
    lf$Transaction,
    {| AddAdhocPublicDeriver: Class<AddAdhocPublicDeriver> |},
    IAddAdhocPublicDeriverRequest<any>,
    Map<number, string>,
    // eslint-disable-next-line no-unused-vars
  ) => Promise<IAddAdhocPublicDeriverResponse<Row>> = async <Row>(
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    return await deps.AddAdhocPublicDeriver.add(
      super.getDb(), tx,
      body,
      super.getConceptualWalletId(),
      derivationTables,
    );
  }
  addAdhocPubicDeriver: <Row>(
    body: IAddAdhocPublicDeriverRequest<any>,
    // eslint-disable-next-line no-unused-vars
  ) => Promise<IAddAdhocPublicDeriverResponse<Row>> = async <Row>(body) => {
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
      async tx => this.rawAddAdhocPubicDeriver(tx, deps, body, derivationTables)
    );
  }
});
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


export async function refreshConceptualWalletFunctionality(
  db: lf$Database,
  conceptualWalletId: number,
): Promise<IConceptualWalletConstructor> {
  const deps = Object.freeze({
    GetHwWalletMeta,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const hardwareInfo = await raii<void | $ReadOnly<HwWalletMetaRow>>(
    db,
    depTables,
    async tx => await deps.GetHwWalletMeta.getMeta(
      db, tx,
      conceptualWalletId,
    )
  );
  const walletType = hardwareInfo == null
    ? WalletTypeOption.WEB_WALLET
    : WalletTypeOption.HARDWARE_WALLET;

  return {
    db,
    conceptualWalletId,
    walletType,
    hardwareInfo,
  };
}

export async function refreshCip1852WalletFunctionality<
  T: ICip1852Wallet & IHasPrivateDeriver & IHasLevels & IHasSign & IConceptualWallet
>(
  db: lf$Database,
  row: $ReadOnly<Cip1852WrapperRow>,
  base: Class<T>,
  protocolMagic: number, // TODO: should be stored in a table somewhere in the future
): Promise<ICip1852Wallet> {
  const conceptualWalletCtorData = await refreshConceptualWalletFunctionality(
    db,
    row.ConceptualWalletId,
  );

  let privateDeriverLevel = null;
  let privateDeriverKeyDerivationId = null;

  let currClass = base;

  if (row.PrivateDeriverLevel != null && row.PrivateDeriverKeyDerivationId != null) {
    currClass = PublicFromPrivate(currClass);
    currClass = GetPrivateDeriverKey(currClass);
    privateDeriverLevel = row.PrivateDeriverLevel;
    privateDeriverKeyDerivationId = row.PrivateDeriverKeyDerivationId;
  } else {
    currClass = AdhocPublicDeriver(currClass);
  }

  const instance = new currClass(
    db,
    conceptualWalletCtorData,
    row,
    privateDeriverLevel,
    privateDeriverKeyDerivationId,
    protocolMagic,
  );
  return instance;
}

export async function refreshBip44WalletFunctionality<
  T: IBip44Wallet & IHasPrivateDeriver & IHasLevels & IHasSign & IConceptualWallet
>(
  db: lf$Database,
  row: $ReadOnly<Bip44WrapperRow>,
  base: Class<T>,
  protocolMagic: number, // TODO: should be stored in a table somewhere in the future
): Promise<IBip44Wallet> {
  const conceptualWalletCtorData = await refreshConceptualWalletFunctionality(
    db,
    row.ConceptualWalletId,
  );

  let privateDeriverLevel = null;
  let privateDeriverKeyDerivationId = null;

  let currClass = base;

  if (row.PrivateDeriverLevel != null && row.PrivateDeriverKeyDerivationId != null) {
    currClass = PublicFromPrivate(currClass);
    currClass = GetPrivateDeriverKey(currClass);
    privateDeriverLevel = row.PrivateDeriverLevel;
    privateDeriverKeyDerivationId = row.PrivateDeriverKeyDerivationId;
  } else {
    currClass = AdhocPublicDeriver(currClass);
  }

  const instance = new currClass(
    db,
    conceptualWalletCtorData,
    row,
    privateDeriverLevel,
    privateDeriverKeyDerivationId,
  );
  return instance;
}
