// @flow

import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetStakingKey, asHasUtxoChains, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  filterAddressesByStakingKey,
  unwrapStakingKey,
  addressToDisplayString,
} from '../../api/ada/lib/storage/bridge/utils';
import type {
  ConfigType,
} from '../../../config/config-types';
import { AddressTypeStore } from '../toplevel/AddressesStore';
import type { StandardAddress, } from '../../types/AddressFilterTypes';
import { addressTypes, addressGroups, AddressGroupTypes, AddressFilter, AddressStoreTypes } from '../../types/AddressFilterTypes';
import globalMessages from '../../i18n/global-messages';
import type { CoreAddressT } from '../../api/ada/lib/storage/database/primitives/enums';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { Cip1852Wallet } from '../../api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { Bip44DerivationLevels } from '../../api/ada/lib/storage/database/walletTypes/bip44/api/utils';
import environment from '../../environment';
import { ChainDerivations } from '../../config/numbersConfig';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';

declare var CONFIG : ConfigType;

const getAddressGroup = () => {
  if (environment.isShelley()) {
    return {
      stable: AddressGroupTypes.group,
      display: addressGroups.group,
    };
  }
  return {
    stable: AddressGroupTypes.byron,
    display: addressGroups.byron,
  };
};

export default class AdaAddressesStore extends Store {

  allAddressesForDisplay: AddressTypeStore<StandardAddress>;
  externalForDisplay: AddressTypeStore<StandardAddress>;
  internalForDisplay: AddressTypeStore<StandardAddress>;
  mangledAddressesForDisplay: AddressTypeStore<StandardAddress>;

  setup(): void {
    super.setup();

    this.allAddressesForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForAllAddresses({
        ...request,
        storeToFilter: this.allAddressesForDisplay,
      }),
      name: {
        stable: AddressStoreTypes.all,
        display: globalMessages.addressesLabel
      },
      groupName: getAddressGroup(),
      shouldHide: (publicDeriver, _store) => {
        const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
        if (withLevels == null) return true;
        const parent = withLevels.getParent();
        if (!(parent instanceof Bip44Wallet || parent instanceof Cip1852Wallet)) {
          return false;
        }
        // don't show this if public deriver level < Account
        return parent.getPublicDeriverLevel() > Bip44DerivationLevels.ACCOUNT.level;
      },
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
    this.externalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: async (request) => this.stores.addresses._createAddressIfNeeded({
        publicDeriver: request.publicDeriver,
        genAddresses: () => this.stores.addresses._wrapForChainAddresses({
          ...request,
          storeToFilter: this.externalForDisplay,
          chainsRequest: { chainId: ChainDerivations.EXTERNAL },
        }),
      }),
      name: {
        stable: AddressStoreTypes.external,
        display: addressTypes.external,
      },
      groupName: getAddressGroup(),
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
    this.internalForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForChainAddresses({
        ...request,
        storeToFilter: this.internalForDisplay,
        chainsRequest: { chainId: ChainDerivations.INTERNAL },
      }),
      name: {
        stable: AddressStoreTypes.internal,
        display: addressTypes.internal,
      },
      groupName: getAddressGroup(),
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
    this.mangledAddressesForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForAllAddresses({
        ...request,
        storeToFilter: this.mangledAddressesForDisplay,
      }),
      name: {
        stable: AddressStoreTypes.mangled,
        display: addressTypes.mangled,
      },
      groupName: getAddressGroup(),
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
      validFilters: [
        AddressFilter.None,
        AddressFilter.Unused,
        AddressFilter.Used,
        AddressFilter.HasBalance,
      ],
    });
  }

  addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      this.allAddressesForDisplay.addObservedWallet(publicDeriver);
    } else {
      this.externalForDisplay.addObservedWallet(publicDeriver);
      this.internalForDisplay.addObservedWallet(publicDeriver);
    }
    if (asGetStakingKey(publicDeriver) != null) {
      this.mangledAddressesForDisplay.addObservedWallet(publicDeriver);
    }
  }

  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);
    if (withHasUtxoChains == null) {
      await this.allAddressesForDisplay.refreshAddressesFromDb(publicDeriver);
    } else {
      await this.externalForDisplay.refreshAddressesFromDb(publicDeriver);
      await this.internalForDisplay.refreshAddressesFromDb(publicDeriver);
    }
    if (asGetStakingKey(publicDeriver) != null) {
      await this.mangledAddressesForDisplay.refreshAddressesFromDb(publicDeriver);
    }
  }

  getStoresForWallet: (
    PublicDeriver<>,
  ) => Array<AddressTypeStore<StandardAddress>> = (publicDeriver) => {
    const withHasUtxoChains = asHasUtxoChains(publicDeriver);

    const stores = [];
    if (withHasUtxoChains == null) {
      stores.push(this.allAddressesForDisplay);
    } else {
      stores.push(this.externalForDisplay);
      stores.push(this.internalForDisplay);
    }

    stores.push(this.mangledAddressesForDisplay);

    return stores;
  }

  getAddressTypesForWallet: (
    PublicDeriver<>,
  ) => Array<CoreAddressT> = (publicDeriver) => {
    const types = [];

    if (publicDeriver.getParent() instanceof Bip44Wallet) {
      types.push(CoreAddressTypes.CARDANO_LEGACY);
    }
    if (environment.isShelley()) {
      types.push(CoreAddressTypes.SHELLEY_GROUP);
    }
    return types;
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    if (request.storeToFilter.name.stable === AddressStoreTypes.all) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: false,
      });
    }
    if (request.storeToFilter.name.stable === AddressStoreTypes.mangled) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: true,
      });
    }
    return filterMangledAddresses({
      publicDeriver: request.publicDeriver,
      baseAddresses: request.addresses,
      invertFilter: false,
    });
  }

  getUnmangleAmounts: void => {|
    canUnmangle: Array<BigNumber>,
    cannotUnmangle: Array<BigNumber>,
  |} = () => {
    const canUnmangle = [];
    const cannotUnmangle = [];
    for (const addrInfo of this.mangledAddressesForDisplay.all
    ) {
      if (addrInfo.value != null) {
        const value = addrInfo.value;
        if (addrInfo.value.gt(CONFIG.genesis.linearFee.coefficient)) {
          canUnmangle.push(value);
        } else {
          cannotUnmangle.push(value);
        }
      }
    }
    const canUnmangleSum = canUnmangle.reduce(
      (sum, val) => sum.plus(val),
      new BigNumber(0)
    );
    const expectedFee = new BigNumber(canUnmangle.length + 1)
      .times(CONFIG.genesis.linearFee.coefficient)
      .plus(CONFIG.genesis.linearFee.constant);

    // if user would strictly lose ADA by making the transaction, don't prompt them to make it
    if (canUnmangleSum.lt(expectedFee)) {
      while (canUnmangle.length > 0) {
        cannotUnmangle.push(canUnmangle.pop());
      }
    }

    return {
      canUnmangle,
      cannotUnmangle
    };
  }
}

async function filterMangledAddresses(request: {|
  publicDeriver: PublicDeriver<>,
  baseAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  invertFilter: boolean,
|}): Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> {
  const withStakingKey = asGetStakingKey(request.publicDeriver);
  if (withStakingKey == null) {
    if (request.invertFilter) return [];
    return request.baseAddresses.map(info => ({
      ...info,
      address: addressToDisplayString(info.address),
    }));
  }

  const stakingKeyResp = await withStakingKey.getStakingKey();
  const stakingKey = unwrapStakingKey(stakingKeyResp.addr.Hash);

  const filterResult = filterAddressesByStakingKey(
    stakingKey,
    request.baseAddresses,
    !request.invertFilter,
  );

  let result = filterResult;
  if (request.invertFilter) {
    const nonMangledSet = new Set(filterResult);
    result = request.baseAddresses.filter(info => !nonMangledSet.has(info));
  }

  return result.map(info => ({
    ...info,
    address: addressToDisplayString(info.address),
  }));
}
