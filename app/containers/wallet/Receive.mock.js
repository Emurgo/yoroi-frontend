// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { GeneratedData } from './Receive';
import type { AddressTypeName } from '../../stores/toplevel/AddressesStore';
import { action } from '@storybook/addon-actions';
import type { AddressFilterKind } from '../../types/AddressFilterTypes';

export const mockReceiveProps: {|
  selected: null | PublicDeriver<>,
  addressFilter: AddressFilterKind,
  getStoresForWallet: PublicDeriver<> => Array<{|
    +isActiveStore: boolean,
    +isHidden: boolean,
    +setAsActiveStore: void => void,
    +name: AddressTypeName,
  |}>,
  location: string
|} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      app: {
        currentRoute: request.location,
      },
      wallets: {
        selected: request.selected,
      },
      addresses: {
        addressFilter: request.addressFilter,
        getStoresForWallet: request.getStoresForWallet,
      },
    },
    actions: {
      addresses: {
        setFilter: { trigger: action('setFilter') },
        resetFilter: { trigger: action('resetFilter') },
      },
      router: {
        goToRoute: { trigger: action('goToRouter') }
      }
    }
  },
});
