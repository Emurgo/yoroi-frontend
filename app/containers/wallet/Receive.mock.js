// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { GeneratedData } from './Receive';
import type { AddressTypeName } from '../../stores/base/AddressesStore';

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
      substores: {
        ada: {
          addresses: {
            getStoresForWallet: request.getStoresForWallet,
          },
        },
      },
    },
  },
});
