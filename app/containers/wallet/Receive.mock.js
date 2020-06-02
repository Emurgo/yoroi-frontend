// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { GeneratedData } from './Receive';
import type { AddressTypeName } from '../../stores/toplevel/AddressesStore';

export const mockReceiveProps: {|
  selected: null | PublicDeriver<>,
  getStoresForWallet: PublicDeriver<> => Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
  |}>,
|} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      wallets: {
        selected: request.selected,
      },
      addresses: {
        getStoresForWallet: request.getStoresForWallet,
      },
    },
  },
});
