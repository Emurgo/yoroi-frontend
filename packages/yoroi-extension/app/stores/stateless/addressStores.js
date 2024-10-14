// @flow

import {
  AddressBookSubgroup,
  ByronAllAddressesSubgroup,
  ByronExternalAddressesSubgroup,
  ByronInternalAddressesSubgroup,
  BaseExternalAddressesSubgroup,
  BaseInternalAddressesSubgroup,
  BaseMangledAddressesSubgroup,
  EnterpriseExternalAddressesSubgroup,
  EnterpriseInternalAddressesSubgroup,
  RewardAddressesSubgroup,
} from '../base/AddressSubgroupStore';
import {
  asHasUtxoChains, asGetAllUtxos, asPickReceive,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import type { AddressFilterKind, StandardAddress, AddressTypeName } from '../../types/AddressFilterTypes';
import {
  AddressFilter,
  AddressGroupTypes,
  AddressSubgroup,
  addressSubgroupName,
  addressGroupName,
} from '../../types/AddressFilterTypes';
import type { StoresMap } from '../index';
import type { ActionsMap } from '../../actions';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import type {
  Addressing,
  BaseSingleAddressPath,
  IPublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { WalletState } from '../../../chrome/extension/background/types';

export type SubgroupCtorData = {|
  stores: StoresMap,
  actions: ActionsMap,
  name: AddressTypeName,
|}
export interface IAddressTypeUiSubset {
  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +wasExecuted: boolean,
}
export interface IAddressTypeStore {
  constructor(data: SubgroupCtorData): IAddressTypeStore;
  +all: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  +wasExecuted: boolean,
  +addObservedWallet: WalletState => void,
  +refreshAddressesFromDb: WalletState => Promise<void>,
}
export type AddressSubgroupMeta<+T: IAddressTypeStore> = {|
  +isRelated: () => boolean,
  +class: Class<T>,
  +validFilters: $ReadOnlyArray<AddressFilterKind>,
  +name: AddressTypeName,
  +isHidden: {|
    result: ?$ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => boolean,
|};

export const allAddressSubgroups: Array<AddressSubgroupMeta<IAddressTypeStore>> = [];
function registerAddressSubgroup<T: IAddressTypeStore>(
  category: AddressSubgroupMeta<T>
): AddressSubgroupMeta<T> {
  allAddressSubgroups.push(category);
  return category;
}

const standardFilter = [
  AddressFilter.None,
  AddressFilter.Unused,
  AddressFilter.Used,
  AddressFilter.HasBalance,
];

export const BYRON_ALL: AddressSubgroupMeta<
  ByronAllAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => false,
  class: ByronAllAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.all,
    group: AddressGroupTypes.byron,
  },
  isHidden: _request => false,
});
export const BYRON_EXTERNAL: AddressSubgroupMeta<
  ByronExternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => false,
  class: ByronExternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.external,
    group: AddressGroupTypes.byron,
  },
  isHidden: _request => false,
});
export const BYRON_INTERNAL: AddressSubgroupMeta<
  ByronInternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => false,
  class: ByronInternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.internal,
    group: AddressGroupTypes.byron,
  },
  isHidden: _request => false,
});
export const BASE_EXTERNAL: AddressSubgroupMeta<
  BaseExternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: BaseExternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.external,
    group: AddressGroupTypes.base,
  },
  isHidden: _request => false,
});
export const BASE_INTERNAL: AddressSubgroupMeta<
  BaseInternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: BaseInternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.internal,
    group: AddressGroupTypes.base,
  },
  isHidden: _request => false,
});
export const BASE_MANGLED: AddressSubgroupMeta<
  BaseMangledAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: BaseMangledAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.mangled,
    group: AddressGroupTypes.base,
  },
  isHidden: request => request.result == null || request.result.length === 0,
});
export const ENTERPRISE_EXTERNAL: AddressSubgroupMeta<
  EnterpriseExternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: EnterpriseExternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.external,
    group: AddressGroupTypes.enterprise,
  },
  // don't show to the user unless they've actually received tokens for this address
  isHidden: request => (
    request.result == null || request.result.filter(addr => addr.isUsed).length === 0
  ),
});
export const ENTERPRISE_INTERNAL: AddressSubgroupMeta<
  EnterpriseInternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: EnterpriseInternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.internal,
    group: AddressGroupTypes.enterprise,
  },
  // don't show to the user unless they've actually received tokens for this address
  isHidden: request => (
    request.result == null || request.result.filter(addr => addr.isUsed).length === 0
  ),
});
export const REWARD_ADDRESS: AddressSubgroupMeta<
  RewardAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: RewardAddressesSubgroup,
  validFilters: [AddressFilter.None],
  name: {
    subgroup: AddressSubgroup.all,
    group: AddressGroupTypes.reward,
  },
  isHidden: request => request.result == null || request.result.length === 0,
});

export const ADDRESS_BOOK: AddressSubgroupMeta<
  AddressBookSubgroup
> = registerAddressSubgroup({
  isRelated: () => true,
  class: AddressBookSubgroup,
  validFilters: [AddressFilter.None],
  name: {
    subgroup: AddressSubgroup.all,
    group: AddressGroupTypes.addressBook,
  },
  isHidden: _request => false,
});

export function applyAddressFilter(request: {|
  addressFilter: AddressFilterKind,
  addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
|}): $ReadOnlyArray<$ReadOnly<StandardAddress>> {
  if (request.addressFilter === AddressFilter.None) {
    return request.addresses;
  }
  if (request.addressFilter === AddressFilter.Unused) {
    return request.addresses.filter(address => (
      address.isUsed === null || address.isUsed === false
    ));
  }
  if (request.addressFilter === AddressFilter.Used) {
    return request.addresses.filter(address => (
      address.isUsed === true
    ));
  }
  if (request.addressFilter === AddressFilter.HasBalance) {
    return request.addresses.filter(address => (
      address.values !== undefined &&
      address.values.values.filter(value => value.amount.gt(0)).length > 0
    ));
  }
  throw new Error(`${nameof(applyAddressFilter)} unknown filter type ${request.addressFilter}`);
}

export const routeForStore = (name: AddressTypeName): string => buildRoute(
  ROUTES.WALLETS.RECEIVE.ADDRESS_LIST,
  {
    group: name.group,
    name: name.subgroup,
  }
);

/**
 * Creates a function that returns information about whether or not
 * a given address belongs to the wallet and which store it belongs to
 */
export function genAddressStoreLookup(
  networkId: number,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
): (string /* payload - not presentational */ => (
  void |
  {|
    store: AddressSubgroupMeta<IAddressTypeStore>,
    address: $ReadOnly<StandardAddress>,
  |}
)) {
  return (address) => {
    const networkInfo = getNetworkById(networkId);
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated()) {
        continue;
      }
      const request = addressSubgroupMap.get(addressStore.class);
      if (request == null) throw new Error('Should never happen');

      const displayAddress = addressToDisplayString(address, networkInfo);
      const addressInfo = request.all.find(
        addressInStore => addressInStore.address === displayAddress
      );
      if (addressInfo != null) {
        return {
          store: addressStore,
          address: addressInfo,
        };
      }
    }
    // this can happen in three main case:
    // 1) When user launches the app:
    // Tx history finishes loading but address stores are still loading
    // Therefore we show the tx history but don't know which store the address belongs to yet
    // 2) The transaction is pending and uses an address we don't know we own yet
    // recall: a transaction shouldn't change wallet state until it's confirmed
    // so if a pending transaction uses an external address that is
    // A) beyond the display cutoff
    // B) within bip44 gap
    // then the address store will not contain this address yet
    // but it will once the transaction confirms
    // 3) A bug and/or unsupported address kind
    return undefined;
  };
}

/**
 * Creates a function that returns information about whether or not
 * a given address belongs to the wallet and which store it belongs to
 */
export function genAddressingLookup(
  networkId: number,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
): (
  string /* payload - not presentational */
) => (void | $PropertyType<Addressing, 'addressing'>) {
  const addressStoreLookup = genAddressStoreLookup(networkId, addressSubgroupMap);
  return (address) => {
    const lookupResult = addressStoreLookup(address);
    if (lookupResult == null) return undefined;

    return lookupResult.address.addressing;
  };
}

/**
 * Creates a function that returns information about whether or not
 * a given address belongs to the wallet with some extra information about the store
 */
export function genAddressLookup(
  networkId: number,
  intl: $npm$ReactIntl$IntlFormat,
  goToRoute: void | (string => void),
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
): (string /* payload - not presentational */ => (
  void |
  {|
    goToRoute: void | (void => void),
    name: string,
    address: $ReadOnly<StandardAddress>,
  |}
)) {
  const addressStoreLookup = genAddressStoreLookup(networkId, addressSubgroupMap);
  return (address) => {
    const lookupResult = addressStoreLookup(address);
    if (lookupResult == null) return undefined;
    const name = lookupResult.store.name.subgroup === AddressSubgroup.all
      ? intl.formatMessage(addressGroupName[lookupResult.store.name.group])
      : `${intl.formatMessage(addressGroupName[lookupResult.store.name.group])} - ${intl.formatMessage(addressSubgroupName[lookupResult.store.name.subgroup])}`;
    return {
      goToRoute: goToRoute == null
        ? goToRoute
        : () => goToRoute(routeForStore(lookupResult.store.name)),
      name,
      address: lookupResult.address,
    };
  };
}

export const mangledStores = [BASE_MANGLED];

// fixme: this function shouldn't be here
export async function getReceiveAddress(
  publicDeriver: IPublicDeriver<>,
): Promise<void | BaseSingleAddressPath> {
  const withChains = asHasUtxoChains(publicDeriver);
  if (withChains) {
    const nextInternal = await withChains.nextInternal();
    return nextInternal.addressInfo;
  }
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos) {

    const allAddresses = await withUtxos.getAllUtxoAddresses();
    const pickReceive = asPickReceive(withUtxos);
    if (pickReceive) {
      return pickReceive.pickReceive(allAddresses[0]);
    }
    // if no particular algorithm for picking the address, just pick the first one
    const address = allAddresses[0];
    return {
      addr: address.addrs[0],
      row: address.row,
      addressing: address.addressing,
    };
  }
  return undefined;
}
