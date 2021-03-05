// @flow

import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { GeneratedData } from './Receive';
import { action } from '@storybook/addon-actions';
import type { AddressFilterKind } from '../../types/AddressFilterTypes';
import type { IAddressTypeStore, IAddressTypeUiSubset } from '../../stores/stateless/addressStores';

export const mockReceiveProps: {|
  selected: null | PublicDeriver<>,
  addressFilter: AddressFilterKind,
  addressSubgroupMap: $ReadOnlyMap<Class<IAddressTypeStore>, IAddressTypeUiSubset>,
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
        addressSubgroupMap: request.addressSubgroupMap,
      },
    },
    actions: {
      addresses: {
        setFilter: { trigger: action('setFilter') },
        resetFilter: { trigger: action('resetFilter') },
      },
      router: {
        redirect: { trigger: action('redirect') },
        goToRoute: { trigger: action('goToRouter') },
      }
    }
  },
});
