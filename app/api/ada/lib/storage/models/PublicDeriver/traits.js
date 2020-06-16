// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import {
  Mixin,
} from 'mixwith';

import type {
  Address,
  Addressing,
  IPublicDeriver,
  IGetAllUtxoAddressesRequest, IGetAllUtxoAddressesResponse,
  IGetAllUtxos, IGetAllUtxosRequest, IGetAllUtxosResponse,
  IPickInternal,
  IPickInternalRequest, IPickInternalResponse,
  IDisplayCutoff,
  IDisplayCutoffPopRequest, IDisplayCutoffPopResponse,
  IDisplayCutoffGetRequest, IDisplayCutoffGetResponse,
  IDisplayCutoffSetRequest, IDisplayCutoffSetResponse,
  IHasUtxoChains, IHasUtxoChainsRequest, IHasUtxoChainsResponse,
  IGetNextUnusedForChainRequest, IGetNextUnusedForChainResponse,
  IGetSigningKey, IGetSigningKeyRequest, IGetSigningKeyResponse,
  INormalizeKeyRequest, INormalizeKeyResponse,
  IScanAddresses, IScanAddressesRequest, IScanAddressesResponse,
  IGetPublic, IGetPublicRequest, IGetPublicResponse,
  IGetUtxoBalance, IGetUtxoBalanceRequest, IGetUtxoBalanceResponse,
  IScanAccountRequest, IScanAccountResponse, IScanUtxo,
  IGetBalance, IGetBalanceRequest, IGetBalanceResponse,
  IGetAllAccountingAddressesRequest, IGetAllAccountingAddressesResponse,
  IGetAllAccounting,
  IGetStakingKeyRequest, IGetStakingKeyResponse,
  IGetStakingKey,
  IAddBip44FromPublic, IAddBip44FromPublicRequest, IAddBip44FromPublicResponse,
} from './interfaces';
import type {
  IChangePasswordRequest, IChangePasswordResponse,
} from '../common/interfaces';
import type {
  IHasPrivateDeriver, IHasLevels, IHasSign, IConceptualWallet,
} from '../ConceptualWallet/interfaces';

import {
  rawGetBip44AddressesByPath,
  rawGetNextUnusedIndex,
  updateCutoffFromInsert,
  getBalanceForUtxos,
} from '../utils';
import {
  normalizeToPubDeriverLevel,
  rawChangePassword,
  decryptKey,
} from '../keyUtils';
import { rawGenAddByHash } from '../../../../../common/lib/storage/bridge/hashMapper';

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
import { ModifyKey, ModifyAddress, } from '../../database/primitives/api/write';

import { v2genAddressBatchFunc, } from '../../../../restoration/byron/scan';
import { ergoGenAddressBatchFunc, } from '../../../../../ergo/lib/restoration/scan';
import { scanBip44Account, } from '../../../../../common/lib/restoration/bip44';
import { scanCip1852Account } from '../../../../restoration/shelley/scan';

import {
  UnusedAddressesError,
} from '../../../../../common/errors';

import { ChainDerivations, } from  '../../../../../../config/numbersConfig';
import type { CoinTypesT, } from  '../../../../../../config/numbersConfig';

import type {
  Bip44PublicDeriver,
  Cip1852PublicDeriver,
} from './index';
import { ConceptualWallet } from '../ConceptualWallet/index';
import { RustModule } from '../../../cardanoCrypto/rustLoader';
import { fromBase58 } from 'bip32';

interface Empty {}
type HasPrivateDeriverDependencies = IPublicDeriver<ConceptualWallet & IHasPrivateDeriver>;
const HasPrivateDeriverMixin = (
  superclass: Class<HasPrivateDeriverDependencies>,
) => (class HasPrivateDeriver extends superclass {
});
export const HasPrivateDeriver: * = Mixin<
  HasPrivateDeriverDependencies,
  Empty,
>(HasPrivateDeriverMixin);
export function asHasPrivateDeriver<Wrapper: ConceptualWallet, Rest=Empty>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasLevels> & Rest) {
  if (obj instanceof HasPrivateDeriver) {
    return obj;
  }
  return undefined;
}

type HasLevelsDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const HasLevelsMixin = (
  superclass: Class<HasLevelsDependencies>,
) => (class HasLevels extends superclass {
});
export const HasLevels: * = Mixin<
  HasLevelsDependencies,
  Empty,
>(HasLevelsMixin);
export function asHasLevels<Wrapper: ConceptualWallet, Rest=Empty>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasLevels> & Rest) {
  if (obj instanceof HasLevels) {
    return obj;
  }
  return undefined;
}

type HasSignDependencies = IPublicDeriver<ConceptualWallet & IHasSign>;
const HasSignMixin = (
  superclass: Class<HasSignDependencies>,
) => (class HasSign extends superclass {
});
export const HasSign: * = Mixin<
  HasSignDependencies,
  Empty,
>(HasSignMixin);
export function asHasSign<Wrapper: ConceptualWallet, Rest=Empty>(
  obj: IPublicDeriver<Wrapper> & Rest
): void | (IPublicDeriver<Wrapper & IHasSign> & Rest) {
  if (obj instanceof HasSign) {
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
) => (class GetAllUtxos extends superclass implements IGetAllUtxos {

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
  getAllUtxoAddresses: (
    IGetAllUtxoAddressesRequest
  ) => Promise<IGetAllUtxoAddressesResponse> = async (
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
});

export const GetAllUtxos: * = Mixin<
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

// ====================
//   GetAllAccounting
// ====================

type GetAllAccountingFuncs = IGetAllAccounting & IGetStakingKey;
type GetAllAccountingDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const GetAllAccountingMixin = (
  superclass: Class<GetAllAccountingDependencies>,
) => (class GetAllAccounting extends superclass implements GetAllAccountingFuncs {

  rawGetAllAccountingAddresses: (
    lf$Transaction,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetAllAccountingAddressesRequest,
    Map<number, string>,
  ) => Promise<IGetAllAccountingAddressesResponse> = async (
    tx,
    deps,
    _body,
    derivationTables,
  ) => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('HasUtxoChains::rawGetAddressesForChain incorrect pubderiver level');
    }
    return rawGetBip44AddressesByPath(
      super.getDb(), tx,
      deps,
      {
        startingDerivation: super.getDerivationId(),
        derivationLevel: this.getParent().getPublicDeriverLevel(),
        commonPrefix: super.getPathToPublic(),
        queryPath: [ChainDerivations.CHIMERIC_ACCOUNT, null],
      },
      derivationTables,
    );
  }
  getAllAccountingAddresses: (
    IGetAllAccountingAddressesRequest
  ) => Promise<IGetAllAccountingAddressesResponse> = async (
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
      async tx => this.rawGetAllAccountingAddresses(tx, deps, body, derivationTables)
    );
  }

  rawGetStakingKey: (
    lf$Transaction,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetStakingKeyRequest,
    Map<number, string>,
  ) => Promise<IGetStakingKeyResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    const allAccounts = await this.rawGetAllAccountingAddresses(tx, deps, body, derivationTables);
    const stakingKeyAccount = allAccounts[0];
    const stakingAddr = stakingKeyAccount.addrs.find(
      addr => addr.Type === CoreAddressTypes.SHELLEY_ACCOUNT
    );
    if (stakingAddr == null) {
      throw new StaleStateError('rawGetStakingKey no account found at account derivation');
    }
    return {
      row: stakingKeyAccount.row,
      addressing: stakingKeyAccount.addressing,
      addr: stakingAddr
    };
  }
  getStakingKey: (
    IGetStakingKeyRequest
  ) => Promise<IGetStakingKeyResponse> = async (
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
      async tx => this.rawGetStakingKey(tx, deps, body, derivationTables)
    );
  }
});

export const GetAllAccounting: * = Mixin<
  GetAllAccountingDependencies,
  GetAllAccountingFuncs,
>(GetAllAccountingMixin);
const GetAllAccountingInstance = (
  (GetAllAccounting: any): ReturnType<typeof GetAllAccountingMixin>
);
export function asGetAllAccounting<T: IPublicDeriver<any>>(
  obj: T
): void | (GetAllAccountingFuncs & GetAllAccountingDependencies & T) {
  if (obj instanceof GetAllAccountingInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   GetStakingKey
// =================

type GetStakingKeyDependencies = IPublicDeriver<> & IGetStakingKey;
const GetStakingKeyMixin = (
  superclass: Class<GetStakingKeyDependencies>,
) => (class GetStakingKey extends superclass implements IGetStakingKey {
});

export const GetStakingKey: * = Mixin<
  GetStakingKeyDependencies,
  IGetStakingKey,
>(GetStakingKeyMixin);
const GetStakingKeyInstance = (
  (GetStakingKey: any): ReturnType<typeof GetStakingKeyMixin>
);
export function asGetStakingKey<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetStakingKey & GetStakingKeyDependencies & T) {
  if (obj instanceof GetStakingKeyInstance) {
    return obj;
  }
  return undefined;
}

// ======================
//   AddBip44FromPublic
// =====================

type AddBip44FromPublicDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const AddBip44FromPublicMixin = (
  superclass: Class<AddBip44FromPublicDependencies>,
) => (class AddBip44FromPublic extends superclass implements IAddBip44FromPublic {

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
});
export const AddBip44FromPublic: * = Mixin<
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

// =================
//   DisplayCutoff
// =================

type DisplayCutoffDependencies = IPublicDeriver<ConceptualWallet & IHasLevels>;
const DisplayCutoffMixin = (
  superclass: Class<DisplayCutoffDependencies>,
) => (class DisplayCutoff extends superclass implements IDisplayCutoff {

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
});

export const DisplayCutoff: * = Mixin<
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

// =====================
//   Bip44PickInternal
// =====================

type Bip44PickInternalMixinDependencies = IPublicDeriver<>;
const Bip44PickInternalMixin = (
  superclass: Class<Bip44PickInternalMixinDependencies>,
) => (class Bip44PickInternal extends superclass implements IPickInternal {
  rawPickInternal: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IPickInternalRequest,
    Map<number, string>,
  ) => Promise<IPickInternalResponse> = async (
    _tx,
    _deps,
    body,
    _derivationTables,
  ) => {
    const legacyAddr = body.addrs
      .filter(addr => addr.Type === CoreAddressTypes.CARDANO_LEGACY);
    if (legacyAddr.length !== 1) throw new Error('pickInternal no legacy address found');
    return {
      addr: legacyAddr[0],
      row: body.row,
      addressing: body.addressing,
    };
  }
});
const Bip44PickInternal: * = Mixin<
  Bip44PickInternalMixinDependencies,
  IPickInternal
>(Bip44PickInternalMixin);

// =======================
//   Cip1852PickInternal
// =======================

type Cip1852PickInternalMixinDependencies = IPublicDeriver<> & IGetStakingKey;
const Cip1852PickInternalMixin = (
  superclass: Class<Cip1852PickInternalMixinDependencies>,
) => (class Cip1852PickInternal extends superclass implements IPickInternal {
  rawPickInternal: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IPickInternalRequest,
    Map<number, string>,
  ) => Promise<IPickInternalResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    const stakingAddressDbRow = await this.rawGetStakingKey(
      tx,
      deps,
      undefined,
      derivationTables
    );
    const stakingAddr = RustModule.WalletV3.Address.from_bytes(
      Buffer.from(stakingAddressDbRow.addr.Hash, 'hex')
    ).to_account_address();
    if (stakingAddr == null) {
      throw new Error(`${nameof(this.rawPickInternal)} staking key invalid`);
    }
    const stakingKey = Buffer.from(stakingAddr.get_account_key().as_bytes()).toString('hex');
    const ourGroupAddress = body.addrs
      .filter(addr => addr.Type === CoreAddressTypes.SHELLEY_GROUP)
      .filter(addr => addr.Hash.includes(stakingKey));
    if (ourGroupAddress.length !== 1) throw new Error('pickInternal no group address found');
    return {
      addr: ourGroupAddress[0],
      row: body.row,
      addressing: body.addressing,
    };
  }
});
export const Cip1852PickInternal: * = Mixin<
  Cip1852PickInternalMixinDependencies,
  IPickInternal
>(Cip1852PickInternalMixin);

// =================
//   HasUtxoChains
// =================

type HasUtxoChainsDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> &
  IPickInternal & IDisplayCutoff;
const HasUtxoChainsMixin = (
  superclass: Class<HasUtxoChainsDependencies>,
) => (class HasUtxoChains extends superclass implements IHasUtxoChains {

  rawGetAddressesForChain: (
    lf$Transaction,
    {|
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IHasUtxoChainsRequest,
    Map<number, string>,
  ) => Promise<IHasUtxoChainsResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ) => {
    if (this.getParent().getPublicDeriverLevel() !== Bip44DerivationLevels.ACCOUNT.level) {
      // we only allow this on accounts instead of any level < ACCOUNT.level to simplify the code
      throw new Error('HasUtxoChains::rawGetAddressesForChain incorrect pubderiver level');
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
  getAddressesForChain: IHasUtxoChainsRequest => Promise<IHasUtxoChainsResponse> = async (
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
    const derivationDeps = {
      GetAddress: deps.GetAddress,
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    };
    const internalAddresses = await this.rawGetAddressesForChain(
      tx,
      derivationDeps,
      { chainId: ChainDerivations.INTERNAL },
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
    const nextInternal = await this.rawPickInternal(
      tx,
      derivationDeps,
      nextUnused.addressInfo,
      derivationTables,
    );
    return {
      addressInfo: nextInternal,
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
});

export const HasUtxoChains: * = Mixin<
  HasUtxoChainsDependencies,
  IHasUtxoChains
>(HasUtxoChainsMixin);
const HasUtxoChainsInstance = (
  (HasUtxoChains: any): ReturnType<typeof HasUtxoChainsMixin>
);
export function asHasUtxoChains<T: IPublicDeriver<any>>(
  obj: T
): void | (IHasUtxoChains & HasUtxoChainsDependencies & T) {
  if (obj instanceof HasUtxoChainsInstance) {
    return obj;
  }
  return undefined;
}

// =================
//   GetPublicKey
// =================

type GetPublicKeyDependencies = IPublicDeriver<>;
const GetPublicKeyMixin = (
  superclass: Class<GetPublicKeyDependencies>,
) => (class GetPublicKey extends superclass implements IGetPublic {

  rawGetPublicKey: (
    lf$Transaction,
    {| GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver> |},
    IGetPublicRequest,
  ) => Promise<IGetPublicResponse> = async (tx, deps, _body) => {
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
  getPublicKey: IGetPublicRequest => Promise<IGetPublicResponse> = async (body) => {
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

  rawChangePubDeriverPassword: (
    lf$Transaction,
    {|
      ModifyKey: Class<ModifyKey>,
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>
    |},
    IChangePasswordRequest,
  ) => Promise<IChangePasswordResponse> = async (tx, deps, body) => {
    const currentRow = await this.rawGetPublicKey(
      tx,
      { GetKeyForPublicDeriver: deps.GetKeyForPublicDeriver, },
      undefined,
    );
    return rawChangePassword(
      super.getDb(), tx,
      { ModifyKey: deps.ModifyKey, },
      {
        ...body,
        oldKeyRow: currentRow
      },
    );
  }
  changePubDeriverPassword: (
    IChangePasswordRequest
  ) => Promise<IChangePasswordResponse> = async (body) => {
    const deps = Object.freeze({
      ModifyKey,
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
});
export const GetPublicKey: * = Mixin<
  GetPublicKeyDependencies,
  IGetPublic
>(GetPublicKeyMixin);
const GetPublicKeyInstance = (
  (GetPublicKey: any): ReturnType<typeof GetPublicKeyMixin>
);
export function asGetPublicKey<T: IPublicDeriver<any>>(
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

type GetSigningKeyDependencies = IPublicDeriver<ConceptualWallet & IHasLevels & IHasSign>;
const GetSigningKeyMixin = (
  superclass: Class<GetSigningKeyDependencies>,
) => (class GetSigningKey extends superclass implements IGetSigningKey {

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
      ModifyKey: Class<ModifyKey>,
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
      { ModifyKey: deps.ModifyKey, },
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
      ModifyKey,
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
    return normalizeToPubDeriverLevel({
      privateKeyRow: body.row,
      password: body.password,
      path: indexPath,
    });
  }
});

export const GetSigningKey: * = Mixin<
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

// =========================
//   ScanLegacyCardanoUtxo
// =========================

type ScanLegacyCardanoUtxoDependencies = IPublicDeriver<>;
const ScanLegacyCardanoUtxoMixin = (
  superclass: Class<ScanLegacyCardanoUtxoDependencies>,
) => (class ScanLegacyCardanoUtxo extends superclass implements IScanUtxo {
  rawScanAccount: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAccountRequest,
    Map<number, string>,
  ) => Promise<IScanAccountResponse> = async (
    _tx,
    _deps,
    body,
    _derivationTables,
  ): Promise<IScanAccountResponse> => {
    const key = RustModule.WalletV2.Bip44AccountPublic.new(
      RustModule.WalletV2.PublicKey.from_hex(body.accountPublicKey),
      RustModule.WalletV2.DerivationScheme.v2()
    );

    return await scanBip44Account({
      generateInternalAddresses: v2genAddressBatchFunc(
        key.bip44_chain(false),
      ),
      generateExternalAddresses: v2genAddressBatchFunc(
        key.bip44_chain(true),
      ),
      lastUsedInternal: body.lastUsedInternal,
      lastUsedExternal: body.lastUsedExternal,
      checkAddressesInUse: body.checkAddressesInUse,
      addByHash: rawGenAddByHash(
        new Set([
          ...body.internalAddresses,
          ...body.externalAddresses,
        ])
      ),
      type: CoreAddressTypes.CARDANO_LEGACY,
    });
  }
});

const ScanLegacyCardanoUtxo: * = Mixin<
  ScanLegacyCardanoUtxoDependencies,
  IScanUtxo,
>(ScanLegacyCardanoUtxoMixin);
const ScanLegacyCardanoUtxoInstance = (
  (ScanLegacyCardanoUtxo: any): ReturnType<typeof ScanLegacyCardanoUtxoMixin>
);
export function asScanLegacyCardanoUtxoInstance<
  T: IPublicDeriver<any>
>(
  obj: T
): void | (IScanUtxo & ScanLegacyCardanoUtxoDependencies & T) {
  if (obj instanceof ScanLegacyCardanoUtxoInstance) {
    return obj;
  }
  return undefined;
}

// ===================
//   ScanShelleyUtxo
// ===================

type ScanShelleyUtxoDependencies = IPublicDeriver<> & IGetStakingKey;
const ScanShelleyUtxoMixin = (
  superclass: Class<ScanShelleyUtxoDependencies>,
) => (class ScanShelleyUtxo extends superclass implements IScanUtxo {
  rawScanAccount: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAccountRequest,
    Map<number, string>,
  ) => Promise<IScanAccountResponse> = async (
    tx,
    deps,
    body,
    derivationTables,
  ): Promise<IScanAccountResponse> => {
    const stakingAddressDbRow = await this.rawGetStakingKey(
      tx,
      deps,
      undefined,
      derivationTables
    );

    const address = RustModule.WalletV3.Address.from_bytes(
      Buffer.from(stakingAddressDbRow.addr.Hash, 'hex')
    );
    const stakingAddress = address.to_account_address();
    if (stakingAddress == null) {
      throw new StaleStateError('Could non-account hash in staking key derivation');
    }
    return await scanCip1852Account({
      accountPublicKey: body.accountPublicKey,
      lastUsedInternal: body.lastUsedInternal,
      lastUsedExternal: body.lastUsedExternal,
      checkAddressesInUse: body.checkAddressesInUse,
      addByHash: rawGenAddByHash(
        new Set([
          ...body.internalAddresses,
          ...body.externalAddresses,
        ])
      ),
      stakingKey: stakingAddress.get_account_key(),
    });
  }
});

const ScanShelleyUtxo: * = Mixin<
  ScanShelleyUtxoDependencies,
  IScanUtxo,
>(ScanShelleyUtxoMixin);
const ScanShelleyUtxoInstance = (
  (ScanShelleyUtxo: any): ReturnType<typeof ScanShelleyUtxoMixin>
);
export function asScanShelleyUtxoInstance<
  T: IPublicDeriver<any>
>(
  obj: T
): void | (IScanUtxo & ScanShelleyUtxoDependencies & T) {
  if (obj instanceof ScanShelleyUtxoInstance) {
    return obj;
  }
  return undefined;
}

// =========================
//   ScanErgoUtxo
// =========================

type ScanErgoUtxoDependencies = IPublicDeriver<>;
const ScanErgoUtxoMixin = (
  superclass: Class<ScanErgoUtxoDependencies>,
) => (class ScanErgoUtxo extends superclass implements IScanUtxo {
  rawScanAccount: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IScanAccountRequest,
    Map<number, string>,
  ) => Promise<IScanAccountResponse> = async (
    _tx,
    _deps,
    body,
    _derivationTables,
  ): Promise<IScanAccountResponse> => {
    const key = fromBase58(body.accountPublicKey);
    return await scanBip44Account({
      generateInternalAddresses: ergoGenAddressBatchFunc(
        key.derive(ChainDerivations.INTERNAL)
      ),
      generateExternalAddresses: ergoGenAddressBatchFunc(
        key.derive(ChainDerivations.EXTERNAL)
      ),
      lastUsedInternal: body.lastUsedInternal,
      lastUsedExternal: body.lastUsedExternal,
      checkAddressesInUse: body.checkAddressesInUse,
      addByHash: rawGenAddByHash(
        new Set([
          ...body.internalAddresses,
          ...body.externalAddresses,
        ])
      ),
      type: CoreAddressTypes.ERGO_P2PK,
    });
  }
});

const ScanErgoUtxo: * = Mixin<
  ScanErgoUtxoDependencies,
  IScanUtxo,
>(ScanErgoUtxoMixin);
const ScanErgoUtxoInstance = (
  (ScanErgoUtxo: any): ReturnType<typeof ScanErgoUtxoMixin>
);
export function asScanErgoUtxoInstance<
  T: IPublicDeriver<any>
>(
  obj: T
): void | (IScanUtxo & ScanErgoUtxoDependencies & T) {
  if (obj instanceof ScanErgoUtxoInstance) {
    return obj;
  }
  return undefined;
}

// ===================
//   ScanUtxoAccount
// ===================

// Abstract way to scan for new addresses given wallet has functionality to scan UTXOs
type ScanUtxoAccountAddressesDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> &
  IHasUtxoChains & IGetPublic & IScanUtxo & IAddBip44FromPublic;
const ScanUtxoAccountAddressesMixin = (
  superclass: Class<ScanUtxoAccountAddressesDependencies>,
) => (class ScanUtxoAccountAddresses extends superclass implements IScanAddresses {
  rawScanAddresses: (
    lf$Transaction,
    {|
      GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
      GetAddress: Class<GetAddress>,
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      ModifyAddress: Class<ModifyAddress>,
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
      { chainId: ChainDerivations.INTERNAL },
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
      { chainId: ChainDerivations.EXTERNAL },
      derivationTables
    );
    const nextUnusedExternal = await rawGetNextUnusedIndex(
      super.getDb(), tx,
      { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx, },
      { addressesForChain: externalAddresses }
    );

    const newToInsert = await this.rawScanAccount(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      {
        accountPublicKey: decryptedKey,
        lastUsedInternal: nextUnusedInternal.index - 1,
        lastUsedExternal: nextUnusedExternal.index - 1,
        checkAddressesInUse: body.checkAddressesInUse,
        internalAddresses: internalAddresses.flatMap(
          address => address.addrs.map(addr => addr.AddressId)
        ),
        externalAddresses: externalAddresses.flatMap(
          address => address.addrs.map(addr => addr.AddressId)
        ),
      },
      derivationTables,
    );

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
      ModifyAddress,
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
});

export const ScanUtxoAccountAddresses: * = Mixin<
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

// ==================
//   GetUtxoBalance
// ==================

type GetUtxoBalanceDependencies = IPublicDeriver<ConceptualWallet & IHasLevels> & IGetAllUtxos;
const GetUtxoBalanceMixin = (
  superclass: Class<GetUtxoBalanceDependencies>,
) => (class GetUtxoBalance extends superclass implements IGetUtxoBalance {

  rawGetUtxoBalance: (
    lf$Transaction,
    {|
      GetPathWithSpecific: Class<GetPathWithSpecific>,
      GetAddress: Class<GetAddress>,
      GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
      GetDerivationSpecific: Class<GetDerivationSpecific>,
    |},
    IGetUtxoBalanceRequest,
    Map<number, string>,
  ) => Promise<IGetUtxoBalanceResponse> = async (tx, deps, _body, derivationTables) => {
    const utxos = await this.rawGetAllUtxos(
      tx,
      {
        GetAddress: deps.GetAddress,
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    return getBalanceForUtxos(utxos.map(utxo => utxo.output.UtxoTransactionOutput));
  }
  getUtxoBalance: IGetUtxoBalanceRequest => Promise<IGetUtxoBalanceResponse> = async (_body) => {
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
    return await raii<IGetUtxoBalanceResponse>(
      super.getDb(),
      [
        ...depTables,
        ...mapToTables(super.getDb(), derivationTables),
      ],
      async tx => this.rawGetUtxoBalance(tx, deps, undefined, derivationTables)
    );
  }
});

export const GetUtxoBalance: * = Mixin<
  GetUtxoBalanceDependencies,
  IGetUtxoBalance,
>(GetUtxoBalanceMixin);
const GetUtxoBalanceInstance = (
  (GetUtxoBalance: any): ReturnType<typeof GetUtxoBalanceMixin>
);
export function asGetUtxoBalance<T: IPublicDeriver<any>>(
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

type ScanAddressesDependencies = IPublicDeriver<> & IScanAddresses;
const ScanAddressesMixin = (
  superclass: Class<ScanAddressesDependencies>,
) => (class ScanAddresses extends superclass implements IScanAddresses {
});

export const ScanAddresses: * = Mixin<
  ScanAddressesDependencies,
  IScanAddresses,
>(ScanAddressesMixin);
const ScanAddressesInstance = (
  (ScanAddresses: any): ReturnType<typeof ScanAddressesMixin>
);
export function asScanAddresses<T: IPublicDeriver<any>>(
  obj: T
): void | (IScanAddresses & ScanAddressesDependencies & T) {
  if (obj instanceof ScanAddressesInstance) {
    return obj;
  }
  return undefined;
}

// ==============
//   GetBalance
// ==============

type GetBalanceDependencies = IPublicDeriver<> & IGetUtxoBalance;
const GetBalanceMixin = (
  superclass: Class<GetBalanceDependencies>,
) => (class GetBalance extends superclass implements IGetBalance {
  getBalance: IGetBalanceRequest => Promise<IGetBalanceResponse> = async (body) => {
    // TODO: also include chimeric account balance
    // be careful because this could confuse users
    // ex: topbar shows 50 ADA so user tries to send 50 ADA as a utxo transaction
    // but they only have 30 UTXO and 20 chimeric-account
    return await this.getUtxoBalance(body);
  }
});

export const GetBalance: * = Mixin<
  GetBalanceDependencies,
  IGetBalance,
>(GetBalanceMixin);
const GetBalanceInstance = (
  (GetBalance: any): ReturnType<typeof GetBalanceMixin>
);
export function asGetBalance<T: IPublicDeriver<any>>(
  obj: T
): void | (IGetBalance & GetBalanceDependencies & T) {
  if (obj instanceof GetBalanceInstance) {
    return obj;
  }
  return undefined;
}


type AddBip44TraitsRequest = {|
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  pubDeriverKeyDerivation: $ReadOnly<KeyDerivationRow>,
  conceptualWallet: IConceptualWallet & IHasLevels & IHasSign,
  startClass: Class<Bip44PublicDeriver>,
|};
type AddBip44TraitsResponse = {|
  finalClass: Class<Bip44PublicDeriver>,
|};
type AddBip44TraitsFunc = (request: AddBip44TraitsRequest) => Promise<AddBip44TraitsResponse>;


const traitFuncLookup: {
  [key: $Call<typeof Number.prototype.toString, CoinTypesT>]: AddBip44TraitsFunc,
  ...
} = {
  /* eslint-disable quote-props */
  '2147485463': addTraitsForCardanoBip44,
  '2147484077': addTraitsForErgoBip44,
  /* eslint-enable quote-props */
};

export async function addTraitsForCardanoBip44(
  request: AddBip44TraitsRequest
): Promise<AddBip44TraitsResponse> {
  let currClass = request.startClass;
  /**
   * WARNING: If you get a weird error about dependencies in this function
   * There is a high chance it has to do with initialization order
   * If a trait X is added after trait Y
   * X must come before Y in this file (even if X doesn't depend on Y)
   */
  currClass = HasPrivateDeriver(currClass);
  currClass = HasLevels(currClass);
  currClass = HasSign(currClass);
  currClass = (GetAllUtxos(currClass): Class<IGetAllUtxos & Bip44PublicDeriver>);

  let publicKey;
  {
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(request.db, table));
    publicKey = await raii<null | $ReadOnly<KeyRow>>(
      request.db,
      depTables,
      async tx => {
        const derivationAndKey = await deps.GetKeyForPublicDeriver.get(
          request.db, tx,
          request.pubDeriver.PublicDeriverId,
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

  if (request.conceptualWallet.getPublicDeriverLevel() === Bip44DerivationLevels.ACCOUNT.level) {
    currClass = DisplayCutoff(currClass);

    currClass = HasUtxoChains(Bip44PickInternal(currClass));
    if (publicKey !== null) {
      currClass = GetPublicKey(currClass);
      currClass = ScanLegacyCardanoUtxo(currClass);
      currClass = ScanUtxoAccountAddresses(currClass);
      currClass = ScanAddresses(currClass);
    }
  } else if (publicKey !== null) {
    currClass = GetPublicKey(currClass);
  }

  if (request.conceptualWallet.getSigningLevel() !== null) {
    currClass = GetSigningKey(currClass);
  }
  currClass = GetUtxoBalance(currClass);
  currClass = GetBalance(currClass);

  return { finalClass: currClass, };
}
export async function addTraitsForErgoBip44(
  request: AddBip44TraitsRequest
): Promise<AddBip44TraitsResponse> {
  let currClass = request.startClass;
  /**
   * WARNING: If you get a weird error about dependencies in this function
   * There is a high chance it has to do with initialization order
   * If a trait X is added after trait Y
   * X must come before Y in this file (even if X doesn't depend on Y)
   */
  currClass = HasPrivateDeriver(currClass);
  currClass = HasLevels(currClass);
  currClass = HasSign(currClass);
  currClass = (GetAllUtxos(currClass): Class<IGetAllUtxos & Bip44PublicDeriver>);

  let publicKey;
  {
    const deps = Object.freeze({
      GetKeyForPublicDeriver,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(request.db, table));
    publicKey = await raii<null | $ReadOnly<KeyRow>>(
      request.db,
      depTables,
      async tx => {
        const derivationAndKey = await deps.GetKeyForPublicDeriver.get(
          request.db, tx,
          request.pubDeriver.PublicDeriverId,
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

  if (request.conceptualWallet.getPublicDeriverLevel() === Bip44DerivationLevels.ACCOUNT.level) {
    currClass = DisplayCutoff(currClass);

    currClass = HasUtxoChains(Bip44PickInternal(currClass));
    if (publicKey !== null) {
      currClass = GetPublicKey(currClass);
      currClass = ScanErgoUtxo(currClass);
      currClass = ScanUtxoAccountAddresses(currClass);
      currClass = ScanAddresses(currClass);
    }
  } else if (publicKey !== null) {
    currClass = GetPublicKey(currClass);
  }

  if (request.conceptualWallet.getSigningLevel() !== null) {
    currClass = GetSigningKey(currClass);
  }
  currClass = GetUtxoBalance(currClass);
  currClass = GetBalance(currClass);

  return { finalClass: currClass, };
}

export async function addTraitsForBip44Child(
  request: AddBip44TraitsRequest
): Promise<{|
  ...AddBip44TraitsResponse,
  pathToPublic: Array<number>,
|}> {
  const traitFunc = traitFuncLookup[request.conceptualWallet.getCoinType().toString()];
  const { finalClass } = await traitFunc(request);

  let pathToPublic;
  {
    const deps = Object.freeze({
      GetDerivationsByPath,
    });
    const depTables = Object
      .keys(deps)
      .map(key => deps[key])
      .flatMap(table => getAllSchemaTables(request.db, table));
    pathToPublic = await raii<Array<number>>(
      request.db,
      depTables,
      async tx => {
        const lvl = request.conceptualWallet.getPublicDeriverLevel();
        const lvlDiff = lvl - Bip44DerivationLevels.ROOT.level;
        const path = await deps.GetDerivationsByPath.getParentPath(
          request.db, tx,
          {
            startingKey: request.pubDeriverKeyDerivation,
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
    finalClass,
    pathToPublic,
  };
}

export async function addTraitsForCip1852Child(
  db: lf$Database,
  pubDeriver: $ReadOnly<PublicDeriverRow>,
  pubDeriverKeyDerivation: $ReadOnly<KeyDerivationRow>,
  conceptualWallet: IHasLevels & IHasSign,
  startClass: Class<Cip1852PublicDeriver>,
): Promise<{|
  finalClass: Class<Cip1852PublicDeriver>,
  pathToPublic: Array<number>,
|}> {
  let currClass = startClass;
  /**
   * WARNING: If you get a weird error about dependencies in this function
   * There is a high chance it has to do with initialization order
   * If a trait X is added after trait Y
   * X must come before Y in this file (even if X doesn't depend on Y)
   */
  currClass = HasPrivateDeriver(currClass);
  currClass = HasLevels(currClass);
  currClass = HasSign(currClass);
  currClass = GetAllUtxos(currClass);
  currClass = GetStakingKey(GetAllAccounting(currClass));

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

  // recall: adding addresses to public deriver in cip1852 is same as bip44
  currClass = AddBip44FromPublic(currClass);

  if (conceptualWallet.getPublicDeriverLevel() === Bip44DerivationLevels.ACCOUNT.level) {
    currClass = DisplayCutoff(currClass);

    currClass = HasUtxoChains(Cip1852PickInternal(currClass));
    if (publicKey !== null) {
      currClass = GetPublicKey(currClass);
      currClass = ScanShelleyUtxo(currClass);
      currClass = ScanUtxoAccountAddresses(currClass);
      currClass = ScanAddresses(currClass);
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
