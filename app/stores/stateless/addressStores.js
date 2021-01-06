// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
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
  GroupExternalAddressesSubgroup,
  GroupInternalAddressesSubgroup,
  GroupMangledAddressesSubgroup,
  P2PKAllAddressesSubgroup,
  P2PKExternalAddressesSubgroup,
  P2PKInternalAddressesSubgroup,
} from '../base/AddressSubgroupStore';
import { CoinTypes, } from '../../config/numbersConfig';
import type { CoinTypesT, } from '../../config/numbersConfig';
import {
  asHasUtxoChains, asHasLevels,
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { Cip1852Wallet } from '../../api/ada/lib/storage/models/Cip1852Wallet/wrapper';
import { getAddressPayload } from '../../api/ada/lib/storage/bridge/utils';
import type { AddressFilterKind, StandardAddress, AddressTypeName } from '../../types/AddressFilterTypes';
import {
  AddressFilter,
  AddressGroupTypes,
  AddressSubgroup,
  addressSubgroupName,
  addressGroupName,
} from '../../types/AddressFilterTypes';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { StoresMap } from '../index';
import type { ActionsMap } from '../../actions';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { CardanoForks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import type {
  Addressing,
} from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

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
  +addObservedWallet: PublicDeriver<> => void,
  +refreshAddressesFromDb: PublicDeriver<> => Promise<void>,
}
export type AddressSubgroupMeta<+T: IAddressTypeStore> = {|
  +isRelated: {|
    selected: PublicDeriver<>,
  |} => (boolean),
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

function matchParent(
  publicDeriver: PublicDeriver<>,
  match: ?ConceptualWallet => boolean
): boolean {
  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  if (withLevels == null) return match(null);
  const parent = withLevels.getParent();
  return match(parent);
}
function matchCoinType(
  publicDeriver: PublicDeriver<>,
  match: CoinTypesT => boolean
): boolean {
  return match(publicDeriver.parent.getNetworkInfo().CoinType);
}
function matchForkType(
  publicDeriver: PublicDeriver<>,
  match: number => boolean
): boolean {
  return match(publicDeriver.parent.getNetworkInfo().Fork);
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) == null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
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
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Haskell)
  ),
  class: RewardAddressesSubgroup,
  validFilters: [AddressFilter.None],
  name: {
    subgroup: AddressSubgroup.all,
    group: AddressGroupTypes.reward,
  },
  isHidden: request => request.result == null || request.result.length === 0,
});
export const GROUP_EXTERNAL: AddressSubgroupMeta<
  GroupExternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Jormungandr)
  ),
  class: GroupExternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.external,
    group: AddressGroupTypes.group,
  },
  isHidden: _request => false,
});
export const GROUP_INTERNAL: AddressSubgroupMeta<
  GroupInternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Jormungandr)
  ),
  class: GroupInternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.internal,
    group: AddressGroupTypes.group,
  },
  isHidden: _request => false,
});
export const GROUP_MANGLED: AddressSubgroupMeta<
  GroupMangledAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Cip1852Wallet) &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO) &&
    matchForkType(request.selected, fork => fork === CardanoForks.Jormungandr)
  ),
  class: GroupMangledAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.mangled,
    group: AddressGroupTypes.group,
  },
  isHidden: request => request.result == null || request.result.length === 0,
});
export const P2PK_ALL: AddressSubgroupMeta<
  P2PKAllAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) == null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.ERGO)
  ),
  class: P2PKAllAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.all,
    group: AddressGroupTypes.p2pk,
  },
  isHidden: _request => false,
});
export const P2PK_EXTERNAL: AddressSubgroupMeta<
  P2PKExternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.ERGO)
  ),
  class: P2PKExternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.external,
    group: AddressGroupTypes.p2pk,
  },
  isHidden: _request => false,
});
export const P2PK_INTERNAL: AddressSubgroupMeta<
  P2PKInternalAddressesSubgroup
> = registerAddressSubgroup({
  isRelated: request => (
    matchParent(request.selected, parent => parent instanceof Bip44Wallet) &&
    asHasUtxoChains(request.selected) != null &&
    matchCoinType(request.selected, coinType => coinType === CoinTypes.ERGO)
  ),
  class: P2PKInternalAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.internal,
    group: AddressGroupTypes.p2pk,
  },
  isHidden: _request => false,
});
export const ADDRESS_BOOK: AddressSubgroupMeta<
  AddressBookSubgroup
> = registerAddressSubgroup({
  isRelated: _publicDeriver => true,
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
  publicDeriver: PublicDeriver<>,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
): (string /* payload - not presentational */ => (
  void |
  {|
    store: AddressSubgroupMeta<IAddressTypeStore>,
    address: $ReadOnly<StandardAddress>,
  |}
)) {
  return (address) => {
    const networkInfo = publicDeriver.getParent().getNetworkInfo();
    for (const addressStore of allAddressSubgroups) {
      if (!addressStore.isRelated({ selected: publicDeriver })) {
        continue;
      }
      const request = addressSubgroupMap.get(addressStore.class);
      if (request == null) throw new Error('Should never happen');

      const addressInfo = request.all.find(
        addressInStore => getAddressPayload(addressInStore.address, networkInfo) === address
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
  publicDeriver: PublicDeriver<>,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
): (
  string /* payload - not presentational */
) => (void | $PropertyType<Addressing, 'addressing'>) {
  const addressStoreLookup = genAddressStoreLookup(publicDeriver, addressSubgroupMap);
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
  publicDeriver: PublicDeriver<>,
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
  const addressStoreLookup = genAddressStoreLookup(publicDeriver, addressSubgroupMap);
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

export const mangledStores = [GROUP_MANGLED, BASE_MANGLED];
