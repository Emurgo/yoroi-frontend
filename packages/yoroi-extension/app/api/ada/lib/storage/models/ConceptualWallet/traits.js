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
import { ConceptualWallet } from './index';
import type { Cip1852WrapperRow } from '../../database/walletTypes/cip1852/tables';
import {
  getAllSchemaTables,
  raii,
  mapToTables,
  StaleStateError,
} from '../../database/utils';
import type { HwWalletMetaRow, ConceptualWalletRow, } from '../../database/walletTypes/core/tables';
import { GetHwWalletMeta, GetConceptualWallet } from '../../database/walletTypes/core/api/read';

import {
  Mixin,
} from 'mixwith';

import { encryptWithPassword } from '../../../../../../utils/passwordCipher';

import {
  DerivePublicDeriverFromKey, AddAdhocPublicDeriver,
} from '../../database/walletTypes/common/api/write';
import { ModifyKey, } from '../../database/primitives/api/write';
import { GetNetworks, GetToken, GetKeyForDerivation, } from '../../database/primitives/api/read';
import type { NetworkRow, TokenRow, } from '../../database/primitives/tables';

import {
  rawChangePassword,
  normalizeToPubDeriverLevel,
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
        const pubDeriverKey = normalizeToPubDeriverLevel({
          privateKeyRow,
          password: body.decryptPrivateDeriverPassword,
          path: body.path.map(entry => entry.index),
        });
        return [
          ...body.path.slice(0, body.path.length - 1).map(pathEntry => ({
            index: pathEntry.index,
            insert: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
              ...pathEntry.insert,
            }),
            privateKey: null,
            publicKey: null,
          })),
          {
            index: body.path[body.path.length - 1].index,
            insert: insertRequest => Promise.resolve({
              KeyDerivationId: insertRequest.keyDerivationId,
              ...body.path[body.path.length - 1].insert,
            }),
            privateKey: body.encryptPublicDeriverPassword === undefined
              ? null
              : {
                Hash: body.encryptPublicDeriverPassword === null
                  ? pubDeriverKey.prvKeyHex
                  : encryptWithPassword(
                    body.encryptPublicDeriverPassword,
                    Buffer.from(pubDeriverKey.prvKeyHex, 'hex')
                  ),
                IsEncrypted: true,
                PasswordLastUpdate: null,
                Type: privateKeyRow.Type, // type doesn't change with derivations
              },
            publicKey: {
              Hash: pubDeriverKey.pubKeyHex,
              IsEncrypted: false,
              PasswordLastUpdate: null,
              Type: privateKeyRow.Type, // type doesn't change with derivations
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
export const PublicFromPrivate: * = Mixin<
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
      ModifyKey: Class<ModifyKey>,
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
      { ModifyKey: deps.ModifyKey, },
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
      ModifyKey
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IChangePasswordResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawChangePrivateDeriverPassword(tx, deps, body)
    );
  }
});

export const GetPrivateDeriverKey: * = Mixin<
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
export const AdhocPublicDeriver: * = Mixin<
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
    GetConceptualWallet,
    GetNetworks,
    GetToken,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const result = await raii<{|
    hardwareInfo: void | $ReadOnly<HwWalletMetaRow>,
    fullInfo: $ReadOnly<ConceptualWalletRow>,
    networkInfo: $ReadOnly<NetworkRow>,
    defaultToken: $ReadOnly<TokenRow>,
  |}>(
    db,
    depTables,
    async tx => {
      const fullInfo = await deps.GetConceptualWallet.get(
        db, tx,
        conceptualWalletId,
      );
      if (fullInfo == null) {
        throw new Error(`${nameof(refreshConceptualWalletFunctionality)} no conceptual wallet with id ${conceptualWalletId}`);
      }
      const hardwareInfo = await deps.GetHwWalletMeta.getMeta(
        db, tx,
        conceptualWalletId,
      );
      const allNetworks = await deps.GetNetworks.get(db, tx);
      const networkForWallet = allNetworks.find(
        network => network.NetworkId === fullInfo.NetworkId
      );
      if (networkForWallet == null) throw new Error(`${nameof(refreshConceptualWalletFunctionality)} missing network ${fullInfo.NetworkId}`);

      const allTokens = await deps.GetToken.all(db, tx);
      const tokenForWallet = allTokens.find(
        network => network.NetworkId === fullInfo.NetworkId
      );
      if (tokenForWallet == null) throw new Error(`${nameof(refreshConceptualWalletFunctionality)} missing token for ${fullInfo.NetworkId}`);
      return {
        hardwareInfo,
        fullInfo,
        networkInfo: networkForWallet,
        defaultToken: tokenForWallet,
      };
    }
  );
  const walletType = result.hardwareInfo == null
    ? WalletTypeOption.WEB_WALLET
    : WalletTypeOption.HARDWARE_WALLET;

  return {
    db,
    conceptualWalletId,
    walletType,
    hardwareInfo: result.hardwareInfo,
    networkInfo: result.networkInfo,
    defaultToken: result.defaultToken,
  };
}

export async function refreshCip1852WalletFunctionality<
  T: ConceptualWallet & ICip1852Wallet & IHasPrivateDeriver & IHasLevels & IHasSign
>(
  db: lf$Database,
  row: $ReadOnly<Cip1852WrapperRow>,
  base: Class<T>,
): Promise<T> {
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
  return (instance: any);
}

// <TODO:PENDING_REMOVAL> bip44
export async function refreshBip44WalletFunctionality<
  T: ConceptualWallet & IBip44Wallet & IHasPrivateDeriver & IHasLevels & IHasSign
>(
  db: lf$Database,
  row: $ReadOnly<Bip44WrapperRow>,
  base: Class<T>,
): Promise<T> {
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
  return (instance: any);
}
