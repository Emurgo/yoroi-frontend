// @flow

import type { Node, ComponentType } from 'react';
import ConnectContainer from './ConnectContainer';
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
  component: ConnectContainer,
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

export const Generic = (): Node => {
  const wallet = genErgoSigningWalletWithCache();

  const walletsState = select(
    'loadingWallets',
    LoadingWalletStates,
    LoadingWalletStates.IDLE
  );
  const errorWallets = walletsState === LoadingWalletStates.REJECTED
    ? 'Test Error'
    : '';

  const wallets = walletsState === LoadingWalletStates.SUCCESS
    ? [{
      publicDeriver: wallet.publicDeriver,
      name: 'Storybook wallet',
      balance: new MultiToken([{
        amount: new BigNumber('1234'),
        identifier: wallet.publicDeriver.getParent().getDefaultToken().defaultIdentifier,
        networkId: wallet.publicDeriver.getParent().getDefaultToken().defaultNetworkId,
      }], wallet.publicDeriver.getParent().getDefaultToken()),
      checksum: {
        ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
        TextPart: 'XLBS-6706',
      },
    }]
    : [];

  return (
    <ConnectContainer
      generated={{
        stores: {
          profile: {
            shouldHideBalance: false
          },
          connector: {
            connectingMessage: undefined,
            filteredWallets: wallets,
            errorWallets,
            loadingWallets: walletsState,
            currentConnectorWhitelist: [],
            protocol: '',
          },
          tokenInfoStore: {
            tokenInfo: mockFromDefaults(defaultAssets),
          },
        },
        actions: {
          connector: {
            getResponse: { trigger: async (req) => action('getResponse')(req) },
            getConnectorWhitelist: { trigger: async (req) => action('getConnectorWhitelist')(req) },
            updateConnectorWhitelist: { trigger: async (req) => action('updateConnectorWhitelist')(req) },
            refreshWallets: { trigger: async (req) => action('refreshWallets')(req) },
            closeWindow: { trigger: action('closeWindow') },
          },
        },
      }}
    />
  );
};
