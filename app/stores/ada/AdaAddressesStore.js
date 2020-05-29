// @flow

import BigNumber from 'bignumber.js';
import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetStakingKey,
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
import { AddressStoreTypes } from '../../types/AddressFilterTypes';
import { addressTypes } from '../../i18n/global-messages';
import { ROUTES } from '../../routes-config';
import type { CoreAddressT } from '../../api/ada/lib/storage/database/primitives/enums';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import environment from '../../environment';

declare var CONFIG : ConfigType;

export default class AdaAddressesStore extends Store {

  mangledAddressesForDisplay: AddressTypeStore<StandardAddress>;

  setup(): void {
    super.setup();

    this.mangledAddressesForDisplay = new AddressTypeStore({
      stores: this.stores,
      actions: this.actions,
      request: (request) => this.stores.addresses._wrapForAllAddresses({
        ...request,
        storeToFilter: this.mangledAddressesForDisplay,
        invertFilter: true,
      }),
      name: {
        stable: AddressStoreTypes.mangled,
        display: addressTypes.mangledLabel,
      },
      route: ROUTES.WALLETS.RECEIVE.MANGLED,
      shouldHide: (_publicDeriver, store) => store.all.length === 0,
    });
  }

  addObservedWallet: PublicDeriver<> => void = (
    publicDeriver
  ) => {
    if (asGetStakingKey(publicDeriver) != null) {
      this.mangledAddressesForDisplay.addObservedWallet(publicDeriver);
    }
  }

  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    publicDeriver
  ) => {
    if (asGetStakingKey(publicDeriver) != null) {
      await this.mangledAddressesForDisplay.refreshAddressesFromDb(publicDeriver);
    }
  }

  getStoresForWallet: (
    PublicDeriver<>,
  ) => Array<AddressTypeStore<StandardAddress>> = (_publicDeriver) => {
    const stores = [];
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
