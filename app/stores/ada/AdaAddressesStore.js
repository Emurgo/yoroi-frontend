// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';

import type { StandardAddress, AddressTypeName, } from '../../types/AddressFilterTypes';
import { AddressGroupTypes, AddressSubgroup } from '../../types/AddressFilterTypes';
import { filterMangledAddresses } from '../stateless/mangledAddresses';

export default class AdaAddressesStore extends Store {

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    if (request.storeName.group === AddressGroupTypes.addressBook) {
      return request.addresses;
    }
    if (request.storeName.subgroup === AddressSubgroup.all) {
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
    return filterMangledAddresses({
      publicDeriver: request.publicDeriver,
      baseAddresses: request.addresses,
      invertFilter: false,
    });
  }
}
