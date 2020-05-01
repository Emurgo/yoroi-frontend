// @flow

import { action } from '@storybook/addon-actions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import type { GeneratedData } from './Receive';

export const mockReceiveProps: {|
  selected: null | PublicDeriver<>,
  activeTab: 'internal' | 'external' | 'mangled',
  hasMangled?: boolean,
|} => {| generated: GeneratedData |} = (request) => ({
  generated: {
    stores: {
      wallets: {
        selected: request.selected,
      },
      substores: {
        ada: {
          addresses: {
            isActiveTab: (tab) => tab === request.activeTab,
            handleTabClick: action('handleTabClick'),
            mangledAddressesForDisplay: {
              hasAny: request.hasMangled === true
            },
          },
        },
      },
    },
  },
});
