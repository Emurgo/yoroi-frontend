// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import { Bip44Wallet } from '../Bip44Wallet';
import { ConceptualWallet } from '../ConceptualWallet/index';

import {
  Mixin,
} from 'mixwith';

import type {
  IPublicDeriver, IPublicDeriverConstructor,
  IAddFromPublic, IAddFromPublicRequest, IAddFromPublicResponse,
  IGetPublic, IGetPublicRequest, IGetPublicResponse,
  IGetAllAddresses, IGetAllAddressesRequest, IGetAllAddressesResponse,
  IGetAllUtxos, IGetAllUtxosRequest, IGetAllUtxosResponse,
  IDisplayCutoff,
  IDisplayCutoffPopRequest, IDisplayCutoffPopResponse,
  IDisplayCutoffGetRequest, IDisplayCutoffGetResponse,
  IDisplayCutoffSetRequest, IDisplayCutoffSetResponse,
  IHasChains, IHasChainsRequest, IHasChainsResponse,
  IGetNextUnusedForChainRequest, IGetNextUnusedForChainResponse,
  IGetUtxoBalance, IGetUtxoBalanceRequest, IGetUtxoBalanceResponse,
  IGetSigningKey, IGetSigningKeyRequest, IGetSigningKeyResponse,
  INormalizeKeyRequest, INormalizeKeyResponse,
  IGetLastSyncInfo, IGetLastSyncInfoRequest, IGetLastSyncInfoResponse,
  IScanAddresses, IScanAddressesRequest, IScanAddressesResponse,
  IBip44Parent,
} from './interfaces';
import type {
  IGetBalance,
  IChangePasswordRequest, IChangePasswordResponse,
  IRename, IRenameRequest, IRenameResponse,
} from '../common/interfaces';

import {
  rawGetBip44AddressesByPath,
  getBalanceForUtxos,
  normalizeToPubDeriverLevel,
  rawChangePassword,
  decryptKey,
  rawGenHashToIdsFunc,
  rawGetNextUnusedIndex,
} from '../utils';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
} from '../../database/utils';

import type {
  Bip44ChainRow,
} from '../../database/bip44/tables';
import type {
  PublicDeriverRow,
} from '../../database/wallet/tables';
import {
  GetPublicDeriver,
  GetKeyForPublicDeriver,
  GetLastSyncForPublicDeriver,
} from '../../database/wallet/api/read';
import { ModifyPublicDeriver } from '../../database/wallet/api/write';
import {
  AddBip44Tree,
  ModifyDisplayCutoff,
} from '../../database/bip44/api/write';
import { GetBip44DerivationSpecific } from '../../database/bip44/api/read';
import {
  Bip44DerivationLevels,
} from '../../database/bip44/api/utils';

import {
  GetUtxoTxOutputsWithTx,
} from  '../../database/utxoTransactions/api/read';

import type {
  KeyRow,
  KeyDerivationRow,
} from '../../database/primitives/tables';
import {
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetKeyDerivation,
  GetKey,
  GetAddress,
} from '../../database/primitives/api/read';
import { UpdateGet, GetOrAddAddress, } from '../../database/primitives/api/write';

import { scanAccountByVersion, } from '../../../../restoreAdaWallet';

import {
  UnusedAddressesError,
} from '../../../../../common';

import { INTERNAL, EXTERNAL, BIP44_SCAN_SIZE, } from  '../../../../../../config/numbersConfig';

// https://github.com/babel/babel-eslint/issues/688#issuecomment-531608020
type Foo = Array<number>; // eslint-disable-line no-unused-vars

/** Snapshot of a PublicDeriver in the database */
export class PublicDeriver implements IPublicDeriver, IRename, IGetLastSyncInfo {
  /**
   * Should only cache information we know will never change
   */

  #publicDeriverId: number;
  #conceptualWallet: ConceptualWallet;
  #derivationId: number;
  #pathToPublic: Array<number>;

  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(data: IPublicDeriverConstructor): PublicDeriver {
    this.#publicDeriverId = data.publicDeriverId;
    this.#conceptualWallet = data.conceptualWallet;
    this.#pathToPublic = data.pathToPublic;
    this.#derivationId = data.derivationId;
    return this;
  }

  getDb(): lf$Database {
    return this.#conceptualWallet.getDb();
  }

  getPublicDeriverId(): number {
    return this.#publicDeriverId;
  }

  getConceptualWallet(): ConceptualWallet {
    return this.#conceptualWallet;
  }

  getPathToPublic(): Array<number> {
    return this.#pathToPublic;
  }

  getDerivationId(): number {
    return this.#derivationId;
  }

  static async createPublicDeriver(
    pubDeriver: $ReadOnly<PublicDeriverRow>,
    bip44Wallet: Bip44Wallet,
  ): Promise<PublicDeriver> {
    return await refreshPublicDeriverFunctionality(
      bip44Wallet.getDb(),
      pubDeriver,
      bip44Wallet,
    );
  }

  getFullPublicDeriverInfo = async (): Promise<$ReadOnly<PublicDeriverRow>> => {
    const deps = Object.freeze({
      GetPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii(
      this.getDb(),
      depTables,
      async tx => {
        const row = await deps.GetPublicDeriver.get(
          this.getDb(), tx,
          this.#publicDeriverId,
        );
        if (row == null) {
          throw new StaleStateError('getFullPublicDeriverInfo PublicDeriver==null');
        }
        return row;
      }
    );
  }

  rawRename = async (
    tx: lf$Transaction,
    deps: {| ModifyPublicDeriver: Class<ModifyPublicDeriver> |},
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    return await deps.ModifyPublicDeriver.rename(
      this.getDb(), tx,
      {
        pubDeriverId: this.#publicDeriverId,
        newName: body.newName,
      }
    );
  }
  rename = async (
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    const deps = Object.freeze({
      ModifyPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii(
      this.getDb(),
      depTables,
      async tx => this.rawRename(tx, deps, body)
    );
  };

  rawGetLastSyncInfo = async (
    tx: lf$Transaction,
    deps: {| GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver> |},
    _body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    return await deps.GetLastSyncForPublicDeriver.forId(
      this.getDb(), tx,
      this.#publicDeriverId
    );
  }
  getLastSyncInfo = async (
    body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    const deps = Object.freeze({
      GetLastSyncForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(this.getDb(), table));
    return await raii<IGetLastSyncInfoResponse>(
      this.getDb(),
      depTables,
      async tx => this.rawGetLastSyncInfo(tx, deps, body)
    );
  }
}

export async function refreshPublicDeriverFunctionality(
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  conceptualWallet: ConceptualWallet,
): Promise<IPublicDeriver> {
  let currClass = PublicDeriver;

  if (!(conceptualWallet instanceof Bip44Wallet)) {
    throw new Error('refreshPublicDeriverFunctionality unimplemented: non-Bip44Wallet type');
  }
  currClass = Bip44Parent(currClass);
  currClass = GetAllAddresses(currClass);
  currClass = GetAllUtxos(currClass);

  let publicKey;
  {
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(db, table));
    publicKey = await raii<null | $ReadOnly<KeyRow>>(
      db,
      depTables,
      async tx => {
        const derivationAndKey = await deps.GetKeyForPublicDeriver.get(
          db, tx,
          pubDeriver.PublicDeriverId,
          true,
          false,
        );
        if (derivationAndKey.publicKey === undefined) {
          throw new StaleStateError('implementations::refreshPublicDeriverFunctionality publicKey');
        }
        return derivationAndKey.publicKey;
      }
    );
  }

  currClass = AddFromPublic(currClass);

  if (conceptualWallet.getPublicDeriverLevel() === Bip44DerivationLevels.ACCOUNT.level) {
    currClass = DisplayCutoff(currClass);

    currClass = HasChains(currClass);
    if (publicKey !== null) {
      currClass = GetPublicKey(currClass);
      currClass = ScanAddresses(ScanUtxoAccountAddresses(currClass));
    }
  } else if (publicKey !== null) {
    currClass = GetPublicKey(currClass);
  }

  if (conceptualWallet.getSigningLevel() !== null) {
    currClass = GetSigningKey(currClass);
  }
  currClass = GetBalance(GetUtxoBalance(currClass));

  let keyDerivation;
  {
    const deps = Object.freeze({
      GetKeyDerivation,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(db, table));
    keyDerivation = await raii<$ReadOnly<KeyDerivationRow>>(
      db,
      depTables,
      async tx => {
        const keyDerivationRow = await deps.GetKeyDerivation.get(
          db, tx,
          pubDeriver.KeyDerivationId,
        );
        if (keyDerivationRow === undefined) {
          throw new StaleStateError('PublicDeriver::refreshPublicDeriverFunctionality keyDerivationRow');
        }
        return keyDerivationRow;
      }
    );
  }

  let pathToPublic;
  {
    const deps = Object.freeze({
      GetDerivationsByPath,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(db, table));
    pathToPublic = await raii<Array<number>>(
      db,
      depTables,
      async tx => {
        const lvlDiff = conceptualWallet.getPublicDeriverLevel() - Bip44DerivationLevels.ROOT.level;
        const path = await deps.GetDerivationsByPath.getParentPath(
          db, tx,
          {
            startingKey: keyDerivation,
            numLevels: lvlDiff,
          },
        );
        const result = [];
        for (const derivation of path.slice(1)) {
          if (derivation.Index == null) {
            throw new Error('PublicDeriver::refreshPublicDeriverFunctionality null index');
          }
          result.push(derivation.Index);
        }
        return result;
      }
    );
  }

  const instance = new currClass({
    publicDeriverId: pubDeriver.PublicDeriverId,
    conceptualWallet,
    pathToPublic,
    derivationId: keyDerivation.KeyDerivationId,
  });
  return instance;
}

// ================
//   Bip44Parent
// ================

type Bip44ParentDependencies = IPublicDeriver;
const Bip44ParentMixin = (
  superclass: Class<Bip44ParentDependencies>,
) => class Bip44Parent extends superclass implements IBip44Parent {

  getBip44Parent = (
    _body: void,
  ): Bip44Wallet => {
    const conceptualWallet = this.getConceptualWallet();
    if (conceptualWallet instanceof Bip44Wallet) {
      return conceptualWallet;
    }
    throw new StaleStateError('getBip44Parent parent is not bip44');
  }
};
const Bip44Parent = Mixin<
  Bip44ParentDependencies,
  IBip44Parent,
>(Bip44ParentMixin);
export const Bip44ParentInstance = (
  (Bip44Parent: any): ReturnType<typeof Bip44ParentMixin>
);
export function asBip44Parent<T: IPublicDeriver>(
  obj: T
): void | (IBip44Parent & Bip44ParentDependencies & T) {
  if (obj instanceof Bip44ParentInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   AddFromPublic
// =================

type AddFromPublicDependencies = IPublicDeriver & IBip44Parent;
const AddFromPublicMixin = (
  superclass: Class<AddFromPublicDependencies>,
) => class AddFromPublic extends superclass implements IAddFromPublic {

  rawAddFromPublic = async (
    tx: lf$Transaction,
    deps: {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddBip44Tree: Class<AddBip44Tree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    body: IAddFromPublicRequest,
  ): Promise<IAddFromPublicResponse> => {
    const pubDeriver = await deps.GetPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
    );
    if (pubDeriver === undefined) {
      throw new Error('AddFromPublic::rawAddFromPublic pubDeriver');
    }
    await deps.AddBip44Tree.add(
      super.getDb(), tx,
      {
        derivationId: pubDeriver.KeyDerivationId,
        children: body.tree,
      },
      this.getBip44Parent().getPublicDeriverLevel(),
    );
    const asDisplayCutoffInstance = asDisplayCutoff(this);
    if (asDisplayCutoffInstance != null) {
      if (this.getBip44Parent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
        throw new Error('DisplayCutoffMixin::getCutoff incorrect pubderiver level');
      }
      const external = body.tree.find(node => node.index === EXTERNAL);
      if (external == null || external.children == null) {
        throw new Error('DisplayCutoffMixin::external should never happen');
      }
      let bestNewCuttoff = 0;
      for (const child of external.children) {
        if (child.index > bestNewCuttoff) {
          bestNewCuttoff = child.index;
        }
      }

      const currentCutoff = await asDisplayCutoffInstance.rawGetCutoff(
        tx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
        },
        undefined,
      );
      if (bestNewCuttoff - BIP44_SCAN_SIZE > currentCutoff) {
        await asDisplayCutoffInstance.rawSetCutoff(
          tx,
          {
            ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
            GetDerivationsByPath: deps.GetDerivationsByPath,
          },
          { newIndex: bestNewCuttoff - BIP44_SCAN_SIZE },
        );
      }
    }
  }
  addFromPublic = async (
    body: IAddFromPublicRequest,
  ): Promise<IAddFromPublicResponse> => {
    const deps = Object.freeze({
      GetPublicDeriver,
      AddBip44Tree,
      ModifyDisplayCutoff,
      GetDerivationsByPath,
      GetPathWithSpecific,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IAddFromPublicResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawAddFromPublic(tx, deps, body)
    );
  }
};
const AddFromPublic = Mixin<
  AddFromPublicDependencies,
  IAddFromPublic,
>(AddFromPublicMixin);
const AddFromPublicInstance = (
  (AddFromPublic: any): ReturnType<typeof AddFromPublicMixin>
);
export function asAddFromPublic<T: IPublicDeriver>(
  obj: T
): void | (IAddFromPublic & AddFromPublicDependencies & T) {
  if (obj instanceof AddFromPublicInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   GetPublicKey
// =================

type GetPublicKeyDependencies = IPublicDeriver;
const GetPublicKeyMixin = (
  superclass: Class<GetPublicKeyDependencies>,
) => class GetPublicKey extends superclass implements IGetPublic {

  rawGetPublicKey = async (
    tx: lf$Transaction,
    deps: {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    _body: IGetPublicRequest,
  ): Promise<IGetPublicResponse> => {
    const derivationAndKey = await deps.GetKeyForPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
      true,
      false,
    );
    if (derivationAndKey.publicKey == null) {
      throw new StaleStateError('GetPublicKey::rawGetPublicKey publicKey');
    }
    return derivationAndKey.publicKey;
  }
  getPublicKey = async (
    body: IGetPublicRequest,
  ): Promise<IGetPublicResponse> => {
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawGetPublicKey(tx, deps, body)
    );
  }

  rawChangePubDeriverPassword = async (
    tx: lf$Transaction,
    deps: {|
      UpdateGet: Class<UpdateGet>,
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: deps.GetKeyForPublicDeriver, },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: deps.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow
      },
    );
  }
  changePubDeriverPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const deps = Object.freeze({
      UpdateGet,
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawChangePubDeriverPassword(tx, deps, body)
    );
  }
};
const GetPublicKey = Mixin<
  GetPublicKeyDependencies,
  IGetPublic
>(GetPublicKeyMixin);
const GetPublicKeyInstance = (
  (GetPublicKey: any): ReturnType<typeof GetPublicKeyMixin>
);
export function asGetPublicKey<T: IPublicDeriver>(
  obj: T
): void | (IGetPublic & GetPublicKeyDependencies & T) {
  if (obj instanceof GetPublicKeyInstance) {
    return obj;
  }
  return undefined;
}

// ==================
//   GetSigningKey
// ==================

type GetSigningKeyDependencies = IPublicDeriver & IBip44Parent;
const GetSigningKeyMixin = (
  superclass: Class<GetSigningKeyDependencies>,
) => class GetSigningKey extends superclass implements IGetSigningKey {

  rawGetSigningKey = async (
    tx: lf$Transaction,
    deps: {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
    |},
    _body: IGetSigningKeyRequest,
  ): Promise<IGetSigningKeyResponse> => {
    const signingLevel = this.getBip44Parent().getSigningLevel();
    if (signingLevel === null) {
      throw new StaleStateError('GetSigningKey::getSigningKey signingLevel=null');
    }

    const levelDifference = this.getBip44Parent().getPublicDeriverLevel() - signingLevel;
    // if bip44 wallet signing level == private deriver level
    if (levelDifference < 0) {
      throw new StaleStateError('GetSigningKey::getSigningKey levelDifference<0');
    }

    const pubDeriver = await deps.GetPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
    );
    if (pubDeriver === undefined) {
      throw new Error('GetSigningKey::getSigningKey pubDeriver');
    }
    const keyDerivation = await deps.GetKeyDerivation.get(
      super.getDb(), tx,
      pubDeriver.KeyDerivationId,
    );
    if (keyDerivation === undefined) {
      throw new Error('GetSigningKey::getSigningKey keyDerivation');
    }
    const path = await deps.GetDerivationsByPath.getParentPath(
      super.getDb(), tx,
      {
        startingKey: keyDerivation,
        numLevels: levelDifference,
      },
    );
    const privateKeyId = path[0].PrivateKeyId;
    if (privateKeyId === null) {
      throw new Error('GetSigningKey::getSigningKey privateKeyId');
    }
    const privateKeyRow = await deps.GetKey.get(
      super.getDb(), tx,
      privateKeyId,
    );
    if (privateKeyRow === undefined) {
      throw new Error('GetSigningKey::getSigningKey privateKeyRow');
    }
    return {
      level: signingLevel,
      path,
      row: privateKeyRow,
    };
  }
  getSigningKey = async (
    body: IGetSigningKeyRequest,
  ): Promise<IGetSigningKeyResponse> => {
    const deps = Object.freeze({
      GetDerivationsByPath,
      GetPublicDeriver,
      GetKeyDerivation,
      GetKey,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetSigningKeyResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawGetSigningKey(tx, deps, body)
    );
  }

  rawChangeSigningKeyPassword = async (
    tx: lf$Transaction,
    deps: {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
      UpdateGet: Class<UpdateGet>,
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetSigningKey(
      tx,
      {
        GetDerivationsByPath: deps.GetDerivationsByPath,
        GetKey: deps.GetKey,
        GetKeyDerivation: deps.GetKeyDerivation,
        GetPublicDeriver: deps.GetPublicDeriver,
      },
      undefined
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: deps.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow.row
      },
    );
  }
  changeSigningKeyPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const deps = Object.freeze({
      GetDerivationsByPath,
      GetPublicDeriver,
      GetKeyDerivation,
      GetKey,
      UpdateGet,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawChangeSigningKeyPassword(tx, deps, body)
    );
  }

  normalizeKey = async (
    body: INormalizeKeyRequest,
  ): Promise<INormalizeKeyResponse> => {
    const pathToPublic = body.path.slice(1);
    const indexPath = pathToPublic.map(derivation => {
      if (derivation.Index === null) {
        throw new Error('GetSigningKey::normalizeKey null index');
      }
      return derivation.Index;
    });
    return normalizeToPubDeriverLevel({
      privateKeyRow: body.row,
      password: body.password,
      path: indexPath,
      version: this.getBip44Parent().getVersion(),
    });
  }
};

const GetSigningKey = Mixin<
  GetSigningKeyDependencies,
  IGetSigningKey,
>(GetSigningKeyMixin);
const GetSigningKeyInstance = (
  (GetSigningKey: any): ReturnType<typeof GetSigningKeyMixin>
);
export function asGetSigningKey<T: IPublicDeriver>(
  obj: T
): void | (IGetSigningKey & GetSigningKeyDependencies & T) {
  if (obj instanceof GetSigningKeyInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   GetAddresses
// =================

type GetAllAddressesDependencies = IPublicDeriver & IBip44Parent;
const GetAllAddressesMixin = (
  superclass: Class<GetAllAddressesDependencies>,
) => class GetAllAddresses extends superclass implements IGetAllAddresses {

  rawGetAllAddresses = async (
    tx: lf$Transaction,
    deps: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    _body: IGetAllAddressesRequest,
  ): Promise<IGetAllAddressesResponse> => {
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getBip44Parent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: Array(
          Bip44DerivationLevels.ADDRESS.level - this.getBip44Parent().getPublicDeriverLevel()
        ).fill(null),
      }
    );
  }
  getAllAddresses = async (
    body: IGetAllAddressesRequest,
  ): Promise<IGetAllAddressesResponse> => {
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawGetAllAddresses(tx, deps, body)
    );
  }
};
const GetAllAddresses = Mixin<
  GetAllAddressesDependencies,
  IGetAllAddresses
>(GetAllAddressesMixin);
const GetAllAddressesInstance = (
  (GetAllAddresses: any): ReturnType<typeof GetAllAddressesMixin>
);
export function asGetAllAddresses<T: IPublicDeriver>(
  obj: T
): void | (IGetAllAddresses & GetAllAddressesDependencies & T) {
  if (obj instanceof GetAllAddressesInstance) {
    return obj;
  }
  return undefined;
}

// ===============
//   GetAllUtxos
// ===============

type GetAllUtxosDependencies = IPublicDeriver & IGetAllAddresses;
const GetAllUtxosMixin = (
  superclass: Class<GetAllUtxosDependencies>,
) => class GetAllUtxos extends superclass implements IGetAllUtxos {

  rawGetAllUtxos = async (
    tx: lf$Transaction,
    deps: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    _body: IGetAllUtxosRequest,
  ): Promise<IGetAllUtxosResponse> => {
    const addresses = await this.rawGetAllAddresses(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      undefined,
    );
    const addressIds = addresses.map(address => address.row.AddressId);
    return await deps.GetUtxoTxOutputsWithTx.getUtxo(
      super.getDb(), tx,
      addressIds,
    );
  }
  getAllUtxos = async (
    _body: IGetAllUtxosRequest,
  ): Promise<IGetAllUtxosResponse> => {
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetUtxoTxOutputsWithTx,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetAllUtxosResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawGetAllUtxos(tx, deps, undefined)
    );
  }
};

const GetAllUtxos = Mixin<
  GetAllUtxosDependencies,
  IGetAllUtxos,
>(GetAllUtxosMixin);
const GetAllUtxosInstance = (
  (GetAllUtxos: any): ReturnType<typeof GetAllUtxosMixin>
);
export function asGetAllUtxos<T: IPublicDeriver>(
  obj: T
): void | (IGetAllUtxos & GetAllUtxosDependencies & T) {
  if (obj instanceof GetAllUtxosInstance) {
    return obj;
  }
  return undefined;
}


// =================
//   DisplayCutoff
// =================

type DisplayCutoffDependencies = IPublicDeriver & IBip44Parent;
const DisplayCutoffMixin = (
  superclass: Class<DisplayCutoffDependencies>,
) => class DisplayCutoff extends superclass implements IDisplayCutoff {

  rawPopAddress  = async (
    tx: lf$Transaction,
    deps: {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetAddress: Class<GetAddress>,
    |},
    _body: IDisplayCutoffPopRequest,
  ): Promise<IDisplayCutoffPopResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::popAddress incorrect pubderiver level');
    }
    const nextAddr = await deps.ModifyDisplayCutoff.pop(
      super.getDb(), tx,
      {
        pubDeriverKeyDerivationId: super.getDerivationId(),
        pathToLevel: [0],
      },
    );
    if (nextAddr === undefined) {
      throw new UnusedAddressesError();
    }
    const addrRows = await deps.GetAddress.getById(
      super.getDb(), tx,
      [nextAddr.row.AddressId],
    );
    const addrRow = addrRows[0];
    if (addrRow === undefined) {
      throw new Error('DisplayCutoff::popAddress should never happen');
    }
    return {
      ...nextAddr,
      addr: addrRow
    };
  }
  popAddress = async (
    body: IDisplayCutoffPopRequest,
  ): Promise<IDisplayCutoffPopResponse> => {
    const deps = Object.freeze({
      ModifyDisplayCutoff,
      GetAddress,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IDisplayCutoffPopResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawPopAddress(tx, deps, body)
    );
  }

  rawGetCutoff = async (
    tx: lf$Transaction,
    deps: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    _body: IDisplayCutoffGetRequest,
  ): Promise<IDisplayCutoffGetResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::getCutoff incorrect pubderiver level');
    }
    const chain = await deps.GetPathWithSpecific.getPath<$ReadOnly<Bip44ChainRow>>(
      super.getDb(), tx,
      {
        pubDeriverKeyDerivationId: super.getDerivationId(),
        pathToLevel: [0],
        level: Bip44DerivationLevels.CHAIN.level,
      },
      async (derivationId) => {
        const result = await GetBip44DerivationSpecific.get<
        Bip44ChainRow
        >(
          super.getDb(), tx,
          [derivationId],
          Bip44DerivationLevels.CHAIN.level,
        );
        const chainDerivation = result[0];
        if (chainDerivation === undefined) {
          throw new Error('DisplayCutoff::rawGetCutoff missing chain. Should never happen');
        }
        return chainDerivation;
      }
    );
    if (chain === undefined) {
      throw new Error('DisplayCutoffMixin::getCutoff no chain found');
    }
    const cutoff = chain.levelSpecific.DisplayCutoff;
    if (cutoff == null) {
      throw new Error('DisplayCutoffMixin::getCutoff null cutoff');
    }
    return cutoff;
  }
  getCutoff = async (
    body: IDisplayCutoffGetRequest,
  ): Promise<IDisplayCutoffGetResponse> => {
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IDisplayCutoffGetResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawGetCutoff(tx, deps, body)
    );
  }

  rawSetCutoff = async (
    tx: lf$Transaction,
    deps: {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
    |},
    body: IDisplayCutoffSetRequest,
  ): Promise<IDisplayCutoffSetResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::popAddress incorrect pubderiver level');
    }
    const path = await deps.GetDerivationsByPath.getSinglePath(
      super.getDb(), tx,
      super.getDerivationId(),
      [0]
    );
    const chain = path[path.length - 1];

    await deps.ModifyDisplayCutoff.set(
      super.getDb(), tx,
      {
        derivationId: chain.KeyDerivationId,
        newIndex: body.newIndex,
      },
    );
  }
  setCutoff = async (
    body: IDisplayCutoffSetRequest,
  ): Promise<IDisplayCutoffSetResponse> => {
    const deps = Object.freeze({
      ModifyDisplayCutoff,
      GetDerivationsByPath,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IDisplayCutoffSetResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawSetCutoff(tx, deps, body)
    );
  }
};

const DisplayCutoff = Mixin<
  DisplayCutoffDependencies,
  IDisplayCutoff,
>(DisplayCutoffMixin);
const DisplayCutoffInstance = (
  (DisplayCutoff: any): ReturnType<typeof DisplayCutoffMixin>
);
export function asDisplayCutoff<T: IPublicDeriver>(
  obj: T
): void | (IDisplayCutoff & DisplayCutoffDependencies & T) {
  if (obj instanceof DisplayCutoffInstance) {
    return obj;
  }
  return undefined;
}

// =============
//   HasChains
// =============

type HasChainsDependencies = IPublicDeriver & IBip44Parent & IDisplayCutoff;
const HasChainsMixin = (
  superclass: Class<HasChainsDependencies>,
) => class HasChains extends superclass implements IHasChains {

  rawGetAddressesForChain = async (
    tx: lf$Transaction,
    deps: {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    body: IHasChainsRequest,
  ): Promise<IHasChainsResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('HasChains::rawGetAddressesForChain incorrect pubderiver level');
    }
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getBip44Parent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: [body.chainId, null],
      },
    );
  }
  getAddressesForChain = async (
    body: IHasChainsRequest,
  ): Promise<IHasChainsResponse> => {
    const deps = Object.freeze({
      GetAddress,
      GetPathWithSpecific,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawGetAddressesForChain(tx, deps, body)
    );
  }

  rawNextInternal = async (
    tx: lf$Transaction,
    deps: {|
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    _body: IGetNextUnusedForChainRequest,
  ): Promise<IGetNextUnusedForChainResponse> => {
    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      { chainId: INTERNAL },
    );
    return await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: internalAddresses },
    );
  }
  nextInternal = async (
    body: IGetNextUnusedForChainRequest,
  ): Promise<IGetNextUnusedForChainResponse> => {
    const deps = Object.freeze({
      GetUtxoTxOutputsWithTx,
      GetAddress,
      GetPathWithSpecific,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawNextInternal(tx, deps, body)
    );
  }
};

const HasChains = Mixin<
  HasChainsDependencies,
  IHasChains
>(HasChainsMixin);
const HasChainsInstance = (
  (HasChains: any): ReturnType<typeof HasChainsMixin>
);
export function asHasChains<T: IPublicDeriver>(
  obj: T
): void | (IHasChains & HasChainsDependencies & T) {
  if (obj instanceof HasChainsInstance) {
    return obj;
  }
  return undefined;
}

// ==============
//   GetBalance
// ==============

type GetBalanceDependencies = IPublicDeriver & IGetBalance;
const GetBalanceMixin = (
  superclass: Class<GetBalanceDependencies>,
) => class GetBalance extends superclass implements IGetBalance {
};

const GetBalance = Mixin<
  GetBalanceDependencies,
  IGetBalance,
>(GetBalanceMixin);
const GetBalanceInstance = (
  (GetBalance: any): ReturnType<typeof GetBalanceMixin>
);
export function asGetBalance<T: IPublicDeriver>(
  obj: T
): void | (IGetBalance & GetBalanceDependencies & T) {
  if (obj instanceof GetBalanceInstance) {
    return obj;
  }
  return undefined;
}


// ==================
//   GetUtxoBalance
// ==================

type GetUtxoBalanceDependencies = IPublicDeriver & IGetAllUtxos;
const GetUtxoBalanceMixin = (
  superclass: Class<GetUtxoBalanceDependencies>,
) => class GetUtxoBalance extends superclass implements IGetUtxoBalance {

  rawGetBalance = async (
    tx: lf$Transaction,
    deps: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    _body: IGetUtxoBalanceRequest,
  ): Promise<IGetUtxoBalanceResponse> => {
    const utxos = await this.rawGetAllUtxos(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      undefined
    );
    return getBalanceForUtxos(utxos);
  }
  getBalance = async (
    _body: IGetUtxoBalanceRequest,
  ): Promise<IGetUtxoBalanceResponse> => {
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetUtxoTxOutputsWithTx,
      GetBip44DerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetUtxoBalanceResponse>(
      super.getDb(),
      depTables,
      async tx => this.rawGetBalance(tx, deps, undefined)
    );
  }
};

const GetUtxoBalance = Mixin<
  GetUtxoBalanceDependencies,
  IGetUtxoBalance,
>(GetUtxoBalanceMixin);
const GetUtxoBalanceInstance = (
  (GetUtxoBalance: any): ReturnType<typeof GetUtxoBalanceMixin>
);
export function asGetUtxoBalance<T: IPublicDeriver>(
  obj: T
): void | (IGetUtxoBalance & GetUtxoBalanceDependencies & T) {
  if (obj instanceof GetUtxoBalanceInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   ScanAddresses
// =================

type ScanAddressesDependencies = IPublicDeriver & IScanAddresses;
const ScanAddressesMixin = (
  superclass: Class<ScanAddressesDependencies>,
) => class ScanAddresses extends superclass implements IScanAddresses {
};

const ScanAddresses = Mixin<
  ScanAddressesDependencies,
  IScanAddresses,
>(ScanAddressesMixin);
export const ScanAddressesInstance = (
  (ScanAddresses: any): ReturnType<typeof ScanAddressesMixin>
);
export function asScanAddresses<T: IPublicDeriver>(
  obj: T
): void | (IScanAddresses & ScanAddressesDependencies & T) {
  if (obj instanceof ScanAddressesInstance) {
    return obj;
  }
  return undefined;
}

type ScanUtxoAccountAddressesDependencies = IPublicDeriver & IBip44Parent &
  IGetPublic & IHasChains & IAddFromPublic;
const ScanUtxoAccountAddressesMixin = (
  superclass: Class<ScanUtxoAccountAddressesDependencies>,
) => class ScanUtxoAccountAddresses extends superclass implements IScanAddresses {
  rawScanAddresses = async (
    tx: lf$Transaction,
    deps: {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetOrAddAddress: Class<GetOrAddAddress>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddBip44Tree: Class<AddBip44Tree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    |},
    body: IScanAddressesRequest,
  ): Promise<IScanAddressesResponse> => {
    const pubKey = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: deps.GetKeyForPublicDeriver },
      undefined
    );
    const decryptedKey = decryptKey(
      pubKey,
      null
    );

    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      { chainId: INTERNAL },
    );
    const nextUnusedInternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: internalAddresses },
    );
    const externalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      { chainId: EXTERNAL },
    );
    const nextUnusedExternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: externalAddresses }
    );
    const newToInsert = await scanAccountByVersion({
      version: this.getBip44Parent().getVersion(),
      accountPublicKey: decryptedKey,
      lastUsedInternal: nextUnusedInternal.index - 1,
      lastUsedExternal: nextUnusedExternal.index - 1,
      checkAddressesInUse: body.checkAddressesInUse,
      hashToIds: rawGenHashToIdsFunc(
        super.getDb(), tx,
        { GetOrAddAddress: deps.GetOrAddAddress },
        new Set([
          ...internalAddresses.map(address => address.addr.AddressId),
          ...externalAddresses.map(address => address.addr.AddressId),
        ])
      ),
      protocolMagic: this.getBip44Parent().getProtocolMagic(),
    });
    await this.rawAddFromPublic(
      tx,
      {
        GetPublicDeriver: deps.GetPublicDeriver,
        AddBip44Tree: deps.AddBip44Tree,
        ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
        GetDerivationsByPath: deps.GetDerivationsByPath,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      { tree: newToInsert },
    );
  }
  scanAddresses = async (
    body: IScanAddressesRequest,
  ): Promise<IScanAddressesResponse> => {
    const depTables = Object.freeze({
      GetKeyForPublicDeriver,
      GetAddress,
      GetPathWithSpecific,
      GetUtxoTxOutputsWithTx,
      GetOrAddAddress,
      GetPublicDeriver,
      AddBip44Tree,
      GetDerivationsByPath,
      ModifyDisplayCutoff,
      GetBip44DerivationSpecific,
    });
    const tables = Object
      .keys(depTables)
      .map(key => depTables[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      tables,
      async tx => this.rawScanAddresses(
        tx,
        depTables,
        body
      )
    );
  }
};

const ScanUtxoAccountAddresses = Mixin<
  ScanUtxoAccountAddressesDependencies,
  IScanAddresses,
>(ScanUtxoAccountAddressesMixin);
const ScanUtxoAccountAddressesInstance = (
  (ScanUtxoAccountAddresses: any): ReturnType<typeof ScanUtxoAccountAddressesMixin>
);
export function asScanUtxoAccountAddressesInstance<T: IPublicDeriver>(
  obj: T
): void | (IScanAddresses & ScanUtxoAccountAddressesDependencies & T) {
  if (obj instanceof ScanUtxoAccountAddressesInstance) {
    return obj;
  }
  return undefined;
}
