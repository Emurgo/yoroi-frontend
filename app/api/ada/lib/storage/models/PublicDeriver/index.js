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
  AddTree,
  ModifyDisplayCutoff,
} from '../../database/bip44/api/write';
import { GetDerivationSpecific } from '../../database/bip44/api/read';
import {
  DerivationLevels,
} from '../../database/bip44/api/utils';

import {
  GetUtxoTxOutputsWithTx,
} from  '../../database/transactions/api/read';

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
    return await raii(
      this.getDb(),
      getAllSchemaTables(this.getDb(), GetPublicDeriver),
      async tx => {
        const row = await GetPublicDeriver.get(
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
    depTables: {| ModifyPublicDeriver: Class<ModifyPublicDeriver> |},
    body: IRenameRequest,
  ): Promise<IRenameResponse> => {
    return await depTables.ModifyPublicDeriver.rename(
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
    return await raii(
      this.getDb(),
      getAllSchemaTables(this.getDb(), ModifyPublicDeriver),
      async tx => this.rawRename(tx, { ModifyPublicDeriver }, body)
    );
  };

  rawGetLastSyncInfo = async (
    tx: lf$Transaction,
    depTables: {| GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver> |},
    _body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    return await depTables.GetLastSyncForPublicDeriver.forId(
      this.getDb(), tx,
      this.#publicDeriverId
    );
  }
  getLastSyncInfo = async (
    body: IGetLastSyncInfoRequest,
  ): Promise<IGetLastSyncInfoResponse> => {
    return await raii<IGetLastSyncInfoResponse>(
      this.getDb(),
      getAllSchemaTables(this.getDb(), GetLastSyncForPublicDeriver),
      async tx => this.rawGetLastSyncInfo(tx, { GetLastSyncForPublicDeriver }, body)
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

  const publicKey = await raii<null | $ReadOnly<KeyRow>>(
    db,
    [
      ...getAllSchemaTables(db, GetKeyForPublicDeriver),
    ],
    async tx => {
      const derivationAndKey = await GetKeyForPublicDeriver.get(
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

  currClass = AddFromPublic(currClass);

  if (conceptualWallet.getPublicDeriverLevel() === DerivationLevels.ACCOUNT.level) {
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

  const keyDerivation = await raii<$ReadOnly<KeyDerivationRow>>(
    db,
    getAllSchemaTables(db, GetKeyDerivation),
    async tx => {
      const keyDerivationRow = await GetKeyDerivation.get(
        db, tx,
        pubDeriver.KeyDerivationId,
      );
      if (keyDerivationRow === undefined) {
        throw new StaleStateError('PublicDeriver::refreshPublicDeriverFunctionality keyDerivationRow');
      }
      return keyDerivationRow;
    }
  );

  const pathToPublic = await raii<Array<number>>(
    db,
    getAllSchemaTables(db, GetDerivationsByPath),
    async tx => {
      const levelDiff = conceptualWallet.getPublicDeriverLevel() - DerivationLevels.ROOT.level;
      const path = await GetDerivationsByPath.getParentPath(
        db, tx,
        {
          startingKey: keyDerivation,
          numLevels: levelDiff,
        },
      );
      const result: Array<number> = [];
      for (const derivation of path.slice(1)) {
        if (derivation.Index == null) {
          throw new Error('PublicDeriver::refreshPublicDeriverFunctionality null index');
        }
        result.push(derivation.Index);
      }
      return result;
    }
  );

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
    depTables: {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddTree: Class<AddTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    body: IAddFromPublicRequest,
  ): Promise<IAddFromPublicResponse> => {
    const pubDeriver = await depTables.GetPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
    );
    if (pubDeriver === undefined) {
      throw new Error('AddFromPublic::rawAddFromPublic pubDeriver');
    }
    await depTables.AddTree.add(
      super.getDb(), tx,
      {
        derivationId: pubDeriver.KeyDerivationId,
        children: body.tree,
      },
      this.getBip44Parent().getPublicDeriverLevel(),
    );
    const asDisplayCutoffInstance = asDisplayCutoff(this);
    if (asDisplayCutoffInstance != null) {
      if (this.getBip44Parent().getPublicDeriverLevel() !== DerivationLevels.ACCOUNT.level) {
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
          GetPathWithSpecific: depTables.GetPathWithSpecific,
          GetDerivationSpecific: depTables.GetDerivationSpecific,
        },
        undefined,
      );
      if (bestNewCuttoff - BIP44_SCAN_SIZE > currentCutoff) {
        await asDisplayCutoffInstance.rawSetCutoff(
          tx,
          {
            ModifyDisplayCutoff: depTables.ModifyDisplayCutoff,
            GetDerivationsByPath: depTables.GetDerivationsByPath,
          },
          { newIndex: bestNewCuttoff - BIP44_SCAN_SIZE },
        );
      }
    }
  }
  addFromPublic = async (
    body: IAddFromPublicRequest,
  ): Promise<IAddFromPublicResponse> => {
    return await raii<IAddFromPublicResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetPublicDeriver),
        ...getAllSchemaTables(super.getDb(), AddTree),
        ...getAllSchemaTables(super.getDb(), ModifyDisplayCutoff),
        ...getAllSchemaTables(super.getDb(), GetDerivationsByPath),
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawAddFromPublic(tx, {
        GetPublicDeriver,
        AddTree,
        ModifyDisplayCutoff,
        GetDerivationsByPath,
        GetPathWithSpecific,
        GetDerivationSpecific,
      }, body)
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
    depTables: {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    _body: IGetPublicRequest,
  ): Promise<IGetPublicResponse> => {
    const derivationAndKey = await depTables.GetKeyForPublicDeriver.get(
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
    return await raii(
      super.getDb(),
      getAllSchemaTables(super.getDb(), GetKeyForPublicDeriver),
      async tx => this.rawGetPublicKey(tx, { GetKeyForPublicDeriver }, body)
    );
  }

  rawChangePubDeriverPassword = async (
    tx: lf$Transaction,
    depTables: {|
      UpdateGet: Class<UpdateGet>,
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>
    |},
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    const currentRow = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: depTables.GetKeyForPublicDeriver, },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: depTables.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow
      },
    );
  }
  changePubDeriverPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), UpdateGet),
        ...getAllSchemaTables(super.getDb(), GetKeyForPublicDeriver),
      ],
      async tx => this.rawChangePubDeriverPassword(
        tx,
        { UpdateGet, GetKeyForPublicDeriver },
        body
      )
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
    depTables: {|
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

    const pubDeriver = await depTables.GetPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
    );
    if (pubDeriver === undefined) {
      throw new Error('GetSigningKey::getSigningKey pubDeriver');
    }
    const keyDerivation = await depTables.GetKeyDerivation.get(
      super.getDb(), tx,
      pubDeriver.KeyDerivationId,
    );
    if (keyDerivation === undefined) {
      throw new Error('GetSigningKey::getSigningKey keyDerivation');
    }
    const path = await depTables.GetDerivationsByPath.getParentPath(
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
    const privateKeyRow = await depTables.GetKey.get(
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
    return await raii<IGetSigningKeyResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetDerivationsByPath),
        ...getAllSchemaTables(super.getDb(), GetPublicDeriver),
        ...getAllSchemaTables(super.getDb(), GetKeyDerivation),
        ...getAllSchemaTables(super.getDb(), GetKey),
      ],
      async tx => this.rawGetSigningKey(
        tx,
        { GetDerivationsByPath, GetPublicDeriver, GetKeyDerivation, GetKey },
        body
      )
    );
  }

  rawChangeSigningKeyPassword = async (
    tx: lf$Transaction,
    depTables: {|
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
        GetDerivationsByPath: depTables.GetDerivationsByPath,
        GetKey: depTables.GetKey,
        GetKeyDerivation: depTables.GetKeyDerivation,
        GetPublicDeriver: depTables.GetPublicDeriver,
      },
      undefined
    );
    return rawChangePassword(
      super.getDb(), tx,
      { UpdateGet: depTables.UpdateGet, },
      {
        ...body,
        oldKeyRow: currentRow.row
      },
    );
  }
  changeSigningKeyPassword = async (
    body: IChangePasswordRequest,
  ): Promise<IChangePasswordResponse> => {
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetDerivationsByPath),
        ...getAllSchemaTables(super.getDb(), GetPublicDeriver),
        ...getAllSchemaTables(super.getDb(), GetKeyDerivation),
        ...getAllSchemaTables(super.getDb(), GetKey),
        ...getAllSchemaTables(super.getDb(), UpdateGet),
      ],
      async tx => this.rawChangeSigningKeyPassword(
        tx,
        { GetDerivationsByPath, GetPublicDeriver, GetKeyDerivation, GetKey, UpdateGet },
        body
      )
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
    depTables: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IGetAllAddressesRequest,
  ): Promise<IGetAllAddressesResponse> => {
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      depTables,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getBip44Parent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: Array(
          DerivationLevels.ADDRESS.level - this.getBip44Parent().getPublicDeriverLevel()
        ).fill(null),
      }
    );
  }
  getAllAddresses = async (
    body: IGetAllAddressesRequest,
  ): Promise<IGetAllAddressesResponse> => {
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetAddress),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawGetAllAddresses(
        tx,
        { GetPathWithSpecific, GetAddress, GetDerivationSpecific, },
        body
      )
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
    depTables: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IGetAllUtxosRequest,
  ): Promise<IGetAllUtxosResponse> => {
    const addresses = await this.rawGetAllAddresses(
      tx,
      {
        GetAddress: depTables.GetAddress,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      undefined,
    );
    const addressIds = addresses.map(address => address.row.AddressId);
    return await depTables.GetUtxoTxOutputsWithTx.getUtxo(
      super.getDb(), tx,
      addressIds,
    );
  }
  getAllUtxos = async (
    _body: IGetAllUtxosRequest,
  ): Promise<IGetAllUtxosResponse> => {
    return await raii<IGetAllUtxosResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetAddress),
        ...getAllSchemaTables(super.getDb(), GetUtxoTxOutputsWithTx),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawGetAllUtxos(
        tx,
        { GetPathWithSpecific, GetAddress, GetUtxoTxOutputsWithTx, GetDerivationSpecific },
        undefined
      )
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
    depTables: {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetAddress: Class<GetAddress>,
    |},
    _body: IDisplayCutoffPopRequest,
  ): Promise<IDisplayCutoffPopResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::popAddress incorrect pubderiver level');
    }
    const nextAddr = await depTables.ModifyDisplayCutoff.pop(
      super.getDb(), tx,
      {
        pubDeriverKeyDerivationId: super.getDerivationId(),
        pathToLevel: [0],
      },
    );
    if (nextAddr === undefined) {
      throw new UnusedAddressesError();
    }
    const addrRows = await depTables.GetAddress.getById(
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
    return await raii<IDisplayCutoffPopResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), ModifyDisplayCutoff),
        ...getAllSchemaTables(super.getDb(), GetAddress),
      ],
      async tx => this.rawPopAddress(tx, { ModifyDisplayCutoff, GetAddress, }, body)
    );
  }

  rawGetCutoff = async (
    tx: lf$Transaction,
    depTables: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IDisplayCutoffGetRequest,
  ): Promise<IDisplayCutoffGetResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::getCutoff incorrect pubderiver level');
    }
    const chain = await depTables.GetPathWithSpecific.getPath<$ReadOnly<Bip44ChainRow>>(
      super.getDb(), tx,
      {
        pubDeriverKeyDerivationId: super.getDerivationId(),
        pathToLevel: [0],
        level: DerivationLevels.CHAIN.level,
      },
      async (derivationId) => {
        const result = await GetDerivationSpecific.get<
        Bip44ChainRow
        >(
          super.getDb(), tx,
          [derivationId],
          DerivationLevels.CHAIN.level,
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
    return await raii<IDisplayCutoffGetResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawGetCutoff(tx, {
        GetPathWithSpecific,
        GetDerivationSpecific,
      }, body)
    );
  }

  rawSetCutoff = async (
    tx: lf$Transaction,
    depTables: {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
    |},
    body: IDisplayCutoffSetRequest,
  ): Promise<IDisplayCutoffSetResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::popAddress incorrect pubderiver level');
    }
    const path = await depTables.GetDerivationsByPath.getSinglePath(
      super.getDb(), tx,
      super.getDerivationId(),
      [0]
    );
    const chain = path[path.length - 1];

    await depTables.ModifyDisplayCutoff.set(
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
    return await raii<IDisplayCutoffSetResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), ModifyDisplayCutoff),
        ...getAllSchemaTables(super.getDb(), GetDerivationsByPath),
      ],
      async tx => this.rawSetCutoff(tx, { ModifyDisplayCutoff, GetDerivationsByPath, }, body)
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
    depTables: {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    body: IHasChainsRequest,
  ): Promise<IHasChainsResponse> => {
    if (this.getBip44Parent().getPublicDeriverLevel() !== DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('HasChains::rawGetAddressesForChain incorrect pubderiver level');
    }
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      depTables,
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
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetAddress),
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawGetAddressesForChain(
        tx,
        { GetAddress, GetPathWithSpecific, GetDerivationSpecific, },
        body
      )
    );
  }

  rawNextInternal = async (
    tx: lf$Transaction,
    depTables: {|
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IGetNextUnusedForChainRequest,
  ): Promise<IGetNextUnusedForChainResponse> => {
    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: depTables.GetAddress,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      { chainId: INTERNAL },
    );
    return await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: depTables.GetUtxoTxOutputsWithTx, },
      { addressesForChain: internalAddresses },
    );
  }
  nextInternal = async (
    body: IGetNextUnusedForChainRequest,
  ): Promise<IGetNextUnusedForChainResponse> => {
    return await raii(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetUtxoTxOutputsWithTx),
        ...getAllSchemaTables(super.getDb(), GetAddress),
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawNextInternal(tx, {
        GetAddress,
        GetPathWithSpecific,
        GetUtxoTxOutputsWithTx,
        GetDerivationSpecific,
      }, body)
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
    depTables: {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    _body: IGetUtxoBalanceRequest,
  ): Promise<IGetUtxoBalanceResponse> => {
    const utxos = await this.rawGetAllUtxos(
      tx,
      {
        GetAddress: depTables.GetAddress,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetUtxoTxOutputsWithTx: depTables.GetUtxoTxOutputsWithTx,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      undefined
    );
    return getBalanceForUtxos(utxos);
  }
  getBalance = async (
    _body: IGetUtxoBalanceRequest,
  ): Promise<IGetUtxoBalanceResponse> => {
    return await raii<IGetUtxoBalanceResponse>(
      super.getDb(),
      [
        ...getAllSchemaTables(super.getDb(), GetPathWithSpecific),
        ...getAllSchemaTables(super.getDb(), GetAddress),
        ...getAllSchemaTables(super.getDb(), GetUtxoTxOutputsWithTx),
        ...getAllSchemaTables(super.getDb(), GetDerivationSpecific),
      ],
      async tx => this.rawGetBalance(
        tx,
        { GetPathWithSpecific, GetAddress, GetUtxoTxOutputsWithTx, GetDerivationSpecific, },
        undefined
      )
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
    depTables: {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetOrAddAddress: Class<GetOrAddAddress>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddTree: Class<AddTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    body: IScanAddressesRequest,
  ): Promise<IScanAddressesResponse> => {
    const pubKey = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: depTables.GetKeyForPublicDeriver },
      undefined
    );
    const decryptedKey = decryptKey(
      pubKey,
      null
    );

    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: depTables.GetAddress,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      { chainId: INTERNAL },
    );
    const nextUnusedInternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: depTables.GetUtxoTxOutputsWithTx, },
      { addressesForChain: internalAddresses },
    );
    const externalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: depTables.GetAddress,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      { chainId: EXTERNAL },
    );
    const nextUnusedExternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: depTables.GetUtxoTxOutputsWithTx, },
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
        { GetOrAddAddress: depTables.GetOrAddAddress },
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
        GetPublicDeriver: depTables.GetPublicDeriver,
        AddTree: depTables.AddTree,
        ModifyDisplayCutoff: depTables.ModifyDisplayCutoff,
        GetDerivationsByPath: depTables.GetDerivationsByPath,
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
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
      AddTree,
      GetDerivationsByPath,
      ModifyDisplayCutoff,
      GetDerivationSpecific,
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
