// @flow

import Store from '../base/Store';
import {
  PublicDeriver,
} from '../../api/ada/lib/storage/models/PublicDeriver/index';
import { AddressTypeStore } from '../toplevel/AddressesStore';
import type { StandardAddress, } from '../../types/AddressFilterTypes';
import type { CoreAddressT } from '../../api/ada/lib/storage/database/primitives/enums';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

export default class ErgoAddressesStore extends Store {

  addObservedWallet: PublicDeriver<> => void = (
    _publicDeriver
  ) => {
    // no special type for Ergo
  }
  refreshAddressesFromDb: PublicDeriver<> => Promise<void> = async (
    _publicDeriver
  ) => {
    // no special type for Ergo
  }

  getStoresForWallet: (
    PublicDeriver<>,
  ) => Array<AddressTypeStore<StandardAddress>> = (_publicDeriver) => {
    const stores = [];
    return stores;
  }

  getAddressTypesForWallet: (
    PublicDeriver<>,
  ) => Array<CoreAddressT> = (_publicDeriver) => {
    const types = [CoreAddressTypes.ERGO_P2PK];
    return types;
  }

  storewiseFilter: {|
    publicDeriver: PublicDeriver<>,
    storeToFilter: AddressTypeStore<StandardAddress>,
    addresses: $ReadOnlyArray<$ReadOnly<StandardAddress>>,
  |} => Promise<$ReadOnlyArray<$ReadOnly<StandardAddress>>> = async (request) => {
    return request.addresses;
  }
}
