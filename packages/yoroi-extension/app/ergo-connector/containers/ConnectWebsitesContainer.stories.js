// @flow

import type { Node, ComponentType } from 'react';
import ConnectWebsitesContainer from './ConnectWebsitesContainer';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import { LoadingWalletStates } from '../types';
import { select, } from '@storybook/addon-knobs';
import { MemoryRouter } from 'react-router';
import Layout from '../components/layout/Layout';
import {
  genErgoSigningWalletWithCache,
} from '../../../stories/helpers/ergo/ErgoMocks';
import { MultiToken } from '../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';
import { mockFromDefaults, } from '../../stores/toplevel/TokenInfoStore';
import { defaultAssets, } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default {
  title: `${__filename.split('.')[0]}`,
  component: ConnectWebsitesContainer,
  decorators: [
    (Story: ComponentType<any>): Node => (
      <MemoryRouter>
        <Layout>
          <Story />
        </Layout>
      </MemoryRouter>
    ),
    withScreenshot,
  ],
};

const genBaseProps: {|
  wallet: *,
  whitelist: *,
|} => * = (request) => {
  const walletsState =  request.whitelist.length === 0
    ? select(
      'loadingWallets',
      LoadingWalletStates,
      LoadingWalletStates.IDLE
    )
    : LoadingWalletStates.SUCCESS;
  const errorWallets = walletsState === LoadingWalletStates.REJECTED
    ? 'Test Error'
    : '';

  const wallets = walletsState === LoadingWalletStates.SUCCESS
    ? [{
      publicDeriver: request.wallet.publicDeriver,
      name: 'Storybook wallet A',
      balance: new MultiToken([{
        amount: new BigNumber('1234'),
        identifier: request.wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
        networkId: request.wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
      }], request.wallet.publicDeriver.getParent().getDefaultToken()),
      checksum: {
        ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
        TextPart: 'XLBS-6706',
      }
    }, {
      publicDeriver: request.wallet.publicDeriver, // note: same as wallet A (for simplicity)
      name: 'Storybook wallet B',
      balance: new MultiToken([{
        amount: new BigNumber('7890'),
        identifier: request.wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
        networkId: request.wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
      }], request.wallet.publicDeriver.getParent().getDefaultToken()),
      checksum: {
        ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
        TextPart: 'XLBS-6706',
      },
    }]
    : [];

  const activeSites = { sites: ['google.com'] };

  return {
    stores: {
      profile: {
        shouldHideBalance: false
      },
      connector: {
        currentConnectorWhitelist: request.whitelist,
        wallets,
        errorWallets,
        loadingWallets: walletsState,
        activeSites,
      },
      tokenInfoStore: {
        tokenInfo: mockFromDefaults(defaultAssets),
      },
    },
    actions: {
      connector: {
        refreshWallets: { trigger: async (req) => action('refreshWallets')(req) },
        removeWalletFromWhitelist: { trigger: async (req) => action('removeWalletFromWhitelist')(req) },
        refreshActiveSites: { trigger: async (req) => action('refreshActiveSites')(req) },
        getConnectorWhitelist: { trigger: async (req) => action('getConnectorWhitelist')(req) },
      },
    },
  };
}
export const EmptyList = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  return (
    <ConnectWebsitesContainer
      generated={genBaseProps({
        whitelist: [],
        wallet,
      })}
    />
  );
};
export const Whitelisted = (): Node => {
  const wallet = genErgoSigningWalletWithCache();
  return (
    <ConnectWebsitesContainer
      generated={genBaseProps({
        whitelist: [
          {
            url: 'google.com',
            publicDeriverId: 0,
            appAuthID: '1',
            auth: null,
            protocol: 'ergo'
          },
          {
            url: 'yoroi.com',
            publicDeriverId: 1,
            appAuthID: '2',
            auth: null,
            protocol: 'cardano'
          },
        ],
        wallet,
      })}
    />
  );
};
