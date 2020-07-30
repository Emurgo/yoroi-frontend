// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import {
  AddressBookSubgroup,
  ByronAllAddressesSubgroup,
  ByronExternalAddressesSubgroup,
  ByronInternalAddressesSubgroup,
  GroupExternalAddressesSubgroup,
  GroupInternalAddressesSubgroup,
  GroupMangledAddressesSubgroup,
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
import type { AddressFilterKind, StandardAddress, AddressTypeName } from '../../types/AddressFilterTypes';
import { AddressFilter, AddressGroupTypes, AddressSubgroup, } from '../../types/AddressFilterTypes';
import {
  ConceptualWallet
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import type { StoresMap } from '../index';
import type { ActionsMap } from '../../actions';
import { ROUTES } from '../../routes-config';
import { buildRoute } from '../../utils/routing';
import { CardanoForks } from '../../api/ada/lib/storage/database/prepackaged/networks';

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
    asHasUtxoChains(request.selected) == null
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
    matchCoinType(request.selected, coinType => coinType === CoinTypes.CARDANO)
  ),
  class: GroupMangledAddressesSubgroup,
  validFilters: standardFilter,
  name: {
    subgroup: AddressSubgroup.mangled,
    group: AddressGroupTypes.group,
  },
  isHidden: request => request.result == null || request.result.length === 0,
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
      address.value !== undefined && address.value.gt(0)
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
