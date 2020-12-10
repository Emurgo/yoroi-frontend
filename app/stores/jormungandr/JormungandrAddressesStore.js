// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

import type { StandardAddress, AddressTypeName, } from '../../types/AddressFilterTypes';
import { AddressGroupTypes, AddressSubgroup } from '../../types/AddressFilterTypes';
import {
  asGetStakingKey
} from '../../api/ada/lib/storage/models/PublicDeriver/traits';
import {
  filterAddressesByStakingKey,
  unwrapStakingKey,
} from '../../api/jormungandr/lib/storage/bridge/utils';

export async function filterMangledAddresses(request: {|
  publicDeriver: PublicDeriver<>,
  baseAddresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  invertFilter: boolean,
|}): Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> {
  const withStakingKey = asGetStakingKey(request.publicDeriver);
  if (withStakingKey == null) {
    if (request.invertFilter) return [];
    return request.baseAddresses.map(info => ({
      ...info,
      address: info.address
    }));
  }

  const stakingKeyResp = await withStakingKey.getStakingKey();

  const stakingKey = unwrapStakingKey(stakingKeyResp.addr.Hash);

  const filterResult = filterAddressesByStakingKey<StandardAddress>(
    stakingKey,
    request.baseAddresses,
    false,
  );

  const nonMangledSet = new Set(filterResult);
  const result = request.baseAddresses.filter(
    info => (request.invertFilter ? !nonMangledSet.has(info) : nonMangledSet.has(info))
  );

  return result.map(info => ({
    ...info,
    address: info.address,
  }));
}

export default class JormungandrAddressesStore extends Store {

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    if (request.storeName.group === AddressGroupTypes.addressBook) {
      return request.addresses;
    }
    if (request.storeName.subgroup === AddressGroupTypes.group) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: false,
      });
    }
    if (request.storeName.subgroup === AddressSubgroup.mangled) {
      return filterMangledAddresses({
        publicDeriver: request.publicDeriver,
        baseAddresses: request.addresses,
        invertFilter: true,
      });
    }
    return request.addresses;
  }
}
