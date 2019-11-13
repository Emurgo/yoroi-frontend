// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import { Bip44Wallet } from './wrapper';

import {
  Mixin,
} from 'mixwith';

import type {
  IPublicDeriver,
  IGetPublic,
  IGetAllUtxoAddressesRequest, IGetAllUtxoAddressesResponse,
  IGetAllUtxos, IGetAllUtxosRequest, IGetAllUtxosResponse,
  IDisplayCutoff,
  IDisplayCutoffPopRequest, IDisplayCutoffPopResponse,
  IDisplayCutoffGetRequest, IDisplayCutoffGetResponse,
  IDisplayCutoffSetRequest, IDisplayCutoffSetResponse,
  IHasChains, IHasChainsRequest, IHasChainsResponse,
  IGetNextUnusedForChainRequest, IGetNextUnusedForChainResponse,
  IGetSigningKey, IGetSigningKeyRequest, IGetSigningKeyResponse,
  INormalizeKeyRequest, INormalizeKeyResponse,
  IScanAddresses, IScanAddressesRequest, IScanAddressesResponse,
} from '../PublicDeriver/interfaces';
import type {
  Address,
  Addressing,
  IChangePasswordRequest, IChangePasswordResponse,
} from '../common/interfaces';
import type {
  IHasPrivateDeriver, IHasLevels, IHasSign,
} from '../common/wrapper/interfaces';
import type { 
  IBip44Wallet,
  IAddBip44FromPublic, IAddBip44FromPublicRequest, IAddBip44FromPublicResponse,
} from './interfaces';

import {
  rawGetBip44AddressesByPath,
  normalizeBip32Ed25519ToPubDeriverLevel,
  rawChangePassword,
  decryptKey,
  rawGetNextUnusedIndex,
  updateCutoffFromInsert,
} from '../utils';
import { rawGenAddByHash } from '../../bridge/hashMapper';

import {
  getAllSchemaTables,
  raii,
  StaleStateError,
  mapToTables,
} from '../../database/utils';

import type {
  Bip44ChainRow,
} from '../../database/walletTypes/common/tables';
import {
  GetPublicDeriver,
  GetKeyForPublicDeriver,
} from '../../database/walletTypes/core/api/read';
import type {
  PublicDeriverRow,
} from '../../database/walletTypes/core/tables';
import {
  ModifyDisplayCutoff,
} from '../../database/walletTypes/bip44/api/write';
import {
  AddDerivationTree,
} from '../../database/walletTypes/common/api/write';
import { GetDerivationSpecific } from '../../database/walletTypes/common/api/read';
import {
  Bip44DerivationLevels,
} from '../../database/walletTypes/bip44/api/utils';

import {
  GetUtxoTxOutputsWithTx,
} from  '../../database/transactionModels/utxo/api/read';

import {
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetKeyDerivation,
  GetKey,
  GetAddress,
} from '../../database/primitives/api/read';
import { CoreAddressTypes } from '../../database/primitives/enums';
import type { KeyRow, KeyDerivationRow, } from '../../database/primitives/tables';
import { UpdateGet, AddAddress, } from '../../database/primitives/api/write';

import { scanBip44Account, } from '../../../../restoration/byron/scan';

import {
  UnusedAddressesError,
} from '../../../../../common';

import { INTERNAL, EXTERNAL, } from  '../../../../../../config/numbersConfig';

import {
  PublicDeriver,
} from '../PublicDeriver/index';
import { ConceptualWallet } from '../ConceptualWallet/index';
import type { IConceptualWallet } from '../ConceptualWallet/interfaces';
import {
  HasPrivateDeriver,
  HasLevels,
  HasSign,
  GetPublicKey,
  ScanAddresses,
  GetUtxoBalance,
  GetBalance,
} from '../common/traits';

export async function addTraitsForBip44Child(
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  pubDeriverKeyDerivation: $ReadOnly<KeyDerivationRow>,
  conceptualWallet: ConceptualWallet,
  startClass: Class<PublicDeriver<Bip44Wallet>>,
): Promise<{|
  finalClass: Class<PublicDeriver<Bip44Wallet>>,
  pathToPublic: Array<number>,
|}> {
  if (!(conceptualWallet instanceof Bip44Wallet)) {
    throw new Error('addTraitsForBip44Child expected Bip44 type');
  }
  let currClass = startClass;
  currClass = HasPrivateDeriver(currClass);
  currClass = HasLevels(currClass);
  currClass = HasSign(currClass);
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
          throw new StaleStateError('addTraitsForBip44Child publicKey');
        }
        return derivationAndKey.publicKey;
      }
    );
  }

  currClass = AddBip44FromPublic(currClass);

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
  currClass = GetUtxoBalance(currClass);
  currClass = GetBalance(currClass);

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
            startingKey: pubDeriverKeyDerivation,
            numLevels: lvlDiff,
          },
        );
        const result = [];
        for (const derivation of path.slice(1)) {
          if (derivation.Index == null) {
            throw new Error('addTraitsForBip44Child null index');
          }
          result.push(derivation.Index);
        }
        return result;
      }
    );
  }
  return {
    finalClass: currClass,
    pathToPublic,
  };
}

// ======================
//   AddBip44FromPublic
// =====================

type AddBip44FromPublicDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const AddBip44FromPublicMixin = (
  superclass: Class<AddBip44FromPublicDependencies>,
) => class AddBip44FromPublic extends superclass implements IAddBip44FromPublic {

  rawAddBip44FromPublic: (
    lf$Transaction,
    {|
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddDerivationTree: Class<AddDerivationTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IAddBip44FromPublicRequest,
    Map<number, string>,
  ) => Promise<IAddBip44FromPublicResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    const pubDeriver = await deps.GetPublicDeriver.get(
      super.getDb(), tx,
      super.getPublicDeriverId(),
    );
    if (pubDeriver === undefined) {
      throw new Error('AddBip44FromPublic::rawAddBip44FromPublic pubDeriver');
    }
    await deps.AddDerivationTree.excludingParent(
      super.getDb(), tx,
      {
        derivationId: pubDeriver.KeyDerivationId,
        children: body.tree,
      },
      derivationTables,
      this.getParent().getPublicDeriverLevel(),
    );
    const asDisplayCutoffInstance = asDisplayCutoff(this);
    if (asDisplayCutoffInstance != null) {
      await updateCutoffFromInsert(
        tx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetDerivationSpecific: deps.GetDerivationSpecific,
          GetDerivationsByPath: deps.GetDerivationsByPath,
          ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
        },
        {
          publicDeriverLevel: this.getParent().getPublicDeriverLevel(),
          displayCutoffInstance: asDisplayCutoffInstance,
          tree: body.tree,
        },
        derivationTables,
      );
    }
  }
  addBip44FromPublic: IAddBip44FromPublicRequest => Promise<IAddBip44FromPublicResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPublicDeriver,
      AddDerivationTree,
      ModifyDisplayCutoff,
      GetDerivationsByPath,
      GetPathWithSpecific,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IAddBip44FromPublicResponse>(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawAddBip44FromPublic(tx, deps, body, derivationTables)
    );
  }
};
const AddBip44FromPublic = Mixin<
  AddBip44FromPublicDependencies,
  IAddBip44FromPublic,
>(AddBip44FromPublicMixin);
const AddBip44FromPublicInstance = (
  (AddBip44FromPublic: any): ReturnType<typeof AddBip44FromPublicMixin>
);
export function asAddBip44FromPublic<T: IPublicDeriver<any>>(
  obj: T
): void | (IAddBip44FromPublic & AddBip44FromPublicDependencies & T) {
  if (obj instanceof AddBip44FromPublicInstance) {
    return obj;
  }
  return undefined;
}

// ==================
//   GetSigningKey
// ==================

type GetSigningKeyDependencies = IPublicDeriver<ConceptualWallet & IHasLevels & IHasSign>;
const GetSigningKeyMixin = (
  superclass: Class<GetSigningKeyDependencies>,
) => class GetSigningKey extends superclass implements IGetSigningKey {

  rawGetSigningKey: (
    lf$Transaction,
    {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
    |},
    IGetSigningKeyRequest,
  ) => Promise<IGetSigningKeyResponse> = async (
    tx,
    deps,
    _body,
  ): Promise<IGetSigningKeyResponse> => {
    const signingLevel = this.getParent().getSigningLevel();
    if (signingLevel === null) {
      throw new StaleStateError('GetSigningKey::getSigningKey signingLevel=null');
    }

    const levelDifference = this.getParent().getPublicDeriverLevel() - signingLevel;
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
  getSigningKey: IGetSigningKeyRequest => Promise<IGetSigningKeyResponse> = async (
    body
  ) => {
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

  rawChangeSigningKeyPassword: (
    lf$Transaction,
    {|
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      GetKeyDerivation: Class<GetKeyDerivation>,
      GetKey: Class<GetKey>,
      UpdateGet: Class<UpdateGet>,
    |},
    IChangePasswordRequest,
  ) => Promise<IChangePasswordResponse> = async (
    tx,
    deps,
    body,
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
  changeSigningKeyPassword: IChangePasswordRequest => Promise<IChangePasswordResponse> = async (
    body,
  ) => {
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

  normalizeKey: INormalizeKeyRequest => Promise<INormalizeKeyResponse> = async (
    body,
  ) => {
    const pathToPublic = body.path.slice(1);
    const indexPath = pathToPublic.map(derivation => {
      if (derivation.Index === null) {
        throw new Error('GetSigningKey::normalizeKey null index');
      }
      return derivation.Index;
    });
    return normalizeBip32Ed25519ToPubDeriverLevel({
      privateKeyRow: body.row,
      password: body.password,
      path: indexPath,
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
export function asGetSigningKey<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetSigningKey & GetSigningKeyDependencies & T) {
  if (obj instanceof GetSigningKeyInstance) {
    return obj;
  }
  return undefined;
}


// ===============
//   GetAllUtxos
// ===============

type GetAllUtxosDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const GetAllUtxosMixin = (
  superclass: Class<GetAllUtxosDependencies>,
) => class GetAllUtxos extends superclass implements IGetAllUtxos {

  rawGetAllUtxos: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllUtxosRequest,
    Map<number, string>,
  ) => Promise<IGetAllUtxosResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ) => {
    const addresses = await this.rawGetAllUtxoAddresses(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    const addressIds = addresses.flatMap(family => family.addrs.map(addr => addr.AddressId));
    const utxosInStorage = await deps.GetUtxoTxOutputsWithTx.getUtxo(
      super.getDb(), tx,
      addressIds,
    );
    const addressingMap = new Map<number, {| ...Address, ...Addressing |}>(
      addresses.flatMap(family => family.addrs.map(addr => [addr.AddressId, {
        addressing: family.addressing,
        address: addr.Hash,
      }]))
    );
    const addressedUtxos = [];
    for (const utxo of utxosInStorage) {
      const addressingInfo = addressingMap.get(utxo.UtxoTransactionOutput.AddressId);
      if (addressingInfo == null) {
        throw new Error('rawGetAllUtxos should never happen');
      }
      addressedUtxos.push({
        output: utxo,
        addressing: addressingInfo.addressing,
        address: addressingInfo.address,
      });
    }
    return addressedUtxos;
  }
  getAllUtxos: IGetAllUtxosRequest => Promise<IGetAllUtxosResponse> = async (
    _body
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetUtxoTxOutputsWithTx,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IGetAllUtxosResponse>(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawGetAllUtxos(tx, deps, undefined, derivationTables)
    );
  }

  rawGetAllUtxoAddresses: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllUtxoAddressesRequest,
    Map<number, string>,
  ) => Promise<IGetAllUtxoAddressesResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ): Promise<IGetAllUtxoAddressesResponse> => {
    // TODO: some way to know if single chain is an account or not
    if (this.getParent().getPublicDeriverLevel() >= Bip44DerivationLevels.CHAIN.level) {
      return rawGetBip44AddressesByPath(
        super.getDb(), tx,
        deps,
        {
          startingDerivation: super.getDerivationId(),
          derivationLevel: this.getParent().getPublicDeriverLevel(),
          commonPrefix: super.getPathToPublic(),
          queryPath: Array(
            Bip44DerivationLevels.ADDRESS.level - this.getParent().getPublicDeriverLevel()
          ).fill(null),
        },
        derivationTables,
      );
    }
    const externalAddresses = await rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getParent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: Array(
          Bip44DerivationLevels.ACCOUNT.level - this.getParent().getPublicDeriverLevel()
        ).fill(null).concat([0, null]),
      },
      derivationTables,
    );
    const internalAddresses = await rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getParent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: Array(
          Bip44DerivationLevels.ACCOUNT.level - this.getParent().getPublicDeriverLevel()
        ).fill(null).concat([1, null]),
      },
      derivationTables,
    );
    return [
      ...externalAddresses,
      ...internalAddresses,
    ];
  }
  getAllUtxoAddresses: IGetAllUtxoAddressesRequest => Promise<IGetAllUtxoAddressesResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetDerivationSpecific,
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
      async tx => this.rawGetAllUtxoAddresses(tx, deps, body, derivationTables)
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
export function asGetAllUtxos<T: IPublicDeriver<any>>(
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

type DisplayCutoffDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const DisplayCutoffMixin = (
  superclass: Class<DisplayCutoffDependencies>,
) => class DisplayCutoff extends superclass implements IDisplayCutoff {

  rawPopAddress: (
    tx: lf$Transaction,
    {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetAddress: Class<GetAddress>,
    |},
    IDisplayCutoffPopRequest,
    Map<number, string>,
  ) => Promise<IDisplayCutoffPopResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ): Promise<IDisplayCutoffPopResponse> => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('DisplayCutoffMixin::popAddress incorrect pubderiver level');
    }
    const nextAddr = await deps.ModifyDisplayCutoff.pop(
      super.getDb(), tx,
      {
        pubDeriverKeyDerivationId: super.getDerivationId(),
        pathToLevel: [0],
      },
      derivationTables,
    );
    if (nextAddr === undefined) {
      throw new UnusedAddressesError();
    }

    const family = await deps.GetAddress.fromCanonical(
      super.getDb(), tx,
      [nextAddr.row.KeyDerivationId],
      undefined,
    );
    const addrs = family.get(nextAddr.row.KeyDerivationId);
    if (addrs == null) {
      throw new Error('DisplayCutoff::popAddress should never happen');
    }
    return {
      ...nextAddr,
      addrs
    };
  }
  popAddress: IDisplayCutoffPopRequest => Promise<IDisplayCutoffPopResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
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
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawPopAddress(tx, deps, body, derivationTables)
    );
  }

  rawGetCutoff: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IDisplayCutoffGetRequest,
     Map<number, string>,
  ) => Promise<IDisplayCutoffGetResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ): Promise<IDisplayCutoffGetResponse> => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
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
        const result = await GetDerivationSpecific.get<
          Bip44ChainRow
        >(
          super.getDb(), tx,
          [derivationId],
          Bip44DerivationLevels.CHAIN.level,
          derivationTables,
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
  getCutoff: IDisplayCutoffGetRequest => Promise<IDisplayCutoffGetResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetPathWithSpecific,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii<IDisplayCutoffGetResponse>(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawGetCutoff(tx, deps, body, derivationTables)
    );
  }

  rawSetCutoff: (
    tx: lf$Transaction,
    {|
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
    |},
    IDisplayCutoffSetRequest,
  ) => Promise<IDisplayCutoffSetResponse> = async (
    tx,
    deps,
    body,
  ): Promise<IDisplayCutoffSetResponse> => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
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
  setCutoff: IDisplayCutoffSetRequest => Promise<IDisplayCutoffSetResponse> = async (
    body,
  ) => {
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
export function asDisplayCutoff<T: IPublicDeriver<any>>(
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

type HasChainsDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> & IDisplayCutoff;
const HasChainsMixin = (
  superclass: Class<HasChainsDependencies>,
) => class HasChains extends superclass implements IHasChains {

  rawGetAddressesForChain: (
    lf$Transaction,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IHasChainsRequest,
    Map<number, string>,
  ) => Promise<IHasChainsResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('HasChains::rawGetAddressesForChain incorrect pubderiver level');
    }
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getParent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: [body.chainId, null],
      },
      derivationTables,
    );
  }
  getAddressesForChain: IHasChainsRequest => Promise<IHasChainsResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetAddress,
      GetPathWithSpecific,
      GetDerivationSpecific,
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
      async tx => this.rawGetAddressesForChain(tx, deps, body, derivationTables)
    );
  }

  rawNextInternal: (
    lf$Transaction,
    {|
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetNextUnusedForChainRequest,
    Map<number, string>,
  ) => Promise<IGetNextUnusedForChainResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ) => {
    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      { chainId: INTERNAL },
      derivationTables,
    );
    const nextUnused = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: internalAddresses },
    );
    if (nextUnused.addressInfo == null) {
      return {
        addressInfo: undefined,
        index: nextUnused.index
      };
    }
    const info = nextUnused.addressInfo;
    // TODO: this behavior is different for CIP-1852
    const legacyAddr = nextUnused.addressInfo.addrs
      .filter(addr => addr.Type === CoreAddressTypes.CARDANO_LEGACY);
    if (legacyAddr.length !== 1) throw new Error('rawNextInternal no legacy address found');
    return {
      addressInfo: {
        addr: legacyAddr[0],
        row: info.row,
        addressing: info.addressing,
      },
      index: nextUnused.index,
    };
  }
  nextInternal: IGetNextUnusedForChainRequest => Promise<IGetNextUnusedForChainResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetUtxoTxOutputsWithTx,
      GetAddress,
      GetPathWithSpecific,
      GetDerivationSpecific,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(super.getDb(), table));
    return await raii(
      super.getDb(),
      depTables,
      async tx => this.rawNextInternal(tx, deps, body, derivationTables)
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
export function asHasChains<T: IPublicDeriver<any>>(
  obj: T
): void | (IHasChains & HasChainsDependencies & T) {
  if (obj instanceof HasChainsInstance) {
    return obj;
  }
  return undefined;
}


type ScanUtxoAccountAddressesDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> &
  IGetPublic & IHasChains & IAddBip44FromPublic;
const ScanUtxoAccountAddressesMixin = (
  superclass: Class<ScanUtxoAccountAddressesDependencies>,
) => class ScanUtxoAccountAddresses extends superclass implements IScanAddresses {
  rawScanAddresses: (
    lf$Transaction,
    {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      AddAddress: Class<AddAddress>,
      GetPublicDeriver: Class<GetPublicDeriver>,
      AddDerivationTree: Class<AddDerivationTree>,
      ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
      GetDerivationsByPath: Class<GetDerivationsByPath>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAddressesRequest,
    Map<number, string>,
  ) => Promise<IScanAddressesResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ): Promise<IScanAddressesResponse> => {
    // TODO: make sure we only scan payment keys
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
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      { chainId: INTERNAL },
      derivationTables
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
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      { chainId: EXTERNAL },
      derivationTables
    );
    const nextUnusedExternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: externalAddresses }
    );
    const newToInsert = await scanBip44Account({
      accountPublicKey: decryptedKey,
      lastUsedInternal: nextUnusedInternal.index - 1,
      lastUsedExternal: nextUnusedExternal.index - 1,
      checkAddressesInUse: body.checkAddressesInUse,
      addByHash: rawGenAddByHash(
        new Set([
          ...internalAddresses.flatMap(address => address.addrs.map(addr => addr.AddressId)),
          ...externalAddresses.flatMap(address => address.addrs.map(addr => addr.AddressId)),
        ])
      ),
    });
    await this.rawAddBip44FromPublic(
      tx,
      {
        GetPublicDeriver: deps.GetPublicDeriver,
        AddDerivationTree: deps.AddDerivationTree,
        ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
        GetDerivationsByPath: deps.GetDerivationsByPath,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      { tree: newToInsert },
      derivationTables,
    );
  }
  scanAddresses: IScanAddressesRequest => Promise<IScanAddressesResponse> = async (
    body,
  ) => {
    const derivationTables = this.getParent().getDerivationTables();
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
      GetAddress,
      GetPathWithSpecific,
      GetUtxoTxOutputsWithTx,
      AddAddress,
      GetPublicDeriver,
      AddDerivationTree,
      GetDerivationsByPath,
      ModifyDisplayCutoff,
      GetDerivationSpecific,
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
      async tx => this.rawScanAddresses(
        tx,
        deps,
        body,
        derivationTables,
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
export function asScanUtxoAccountAddressesInstance<
  T: IPublicDeriver<any>
>(
  obj: T
): void | (IScanAddresses & ScanUtxoAccountAddressesDependencies & T) {
  if (obj instanceof ScanUtxoAccountAddressesInstance) {
    return obj;
  }
  return undefined;
}
