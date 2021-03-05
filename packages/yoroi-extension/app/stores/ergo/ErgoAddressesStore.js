// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { StandardAddress, AddressTypeName, } from '../../types/AddressFilterTypes';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';

export default class ErgoAddressesStore extends Store<StoresMap, ActionsMap> {
  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeName: AddressTypeName,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    return request.addresses;
  }
}
