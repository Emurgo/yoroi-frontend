// @flow

import React from 'react';
import type { Node, ComponentType } from 'react';
import ConnectWebsitesContainer from './ConnectWebsitesContainer';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import { LoadingWalletStates } from '../types';
import { select, } from '@storybook/addon-knobs';
import { MemoryRouter } from 'react-router';
import Layout from '../components/layout/Layout';

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
      name: 'Storybook wallet A',
      balance: '1234',
      checksum: {
        ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
        TextPart: 'XLBS-6706',
      }},{
      name: 'Storybook wallet B',
      balance: '7890',
      checksum: {
        ImagePart: '7b9bf637f341bed7933c8673f9fb7e405097746115f24ec7d192f80fb6efb219da8bc1902dab99fc070f156b7877f29dd8e581da616ff7fdad28493d084a0db9',
        TextPart: 'XLBS-6706',
      },
    }]
    : [];

  const activeSites = { sites: ['google.com'] };

  return {
    stores: {
      connector: {
        currentConnectorWhitelist: request.whitelist,
        wallets,
        errorWallets,
        loadingWallets: walletsState,
        activeSites,
      },
    },
    actions: {
      connector: {
        getWallets: { trigger: action('getWallets') },
        removeWalletFromWhitelist: { trigger: async (req) => action('removeWalletFromWhitelist')(req) },
        refreshActiveSites: { trigger: async (req) => action('refreshActiveSites')(req) },
        getConnectorWhitelist: { trigger: async (req) => action('getConnectorWhitelist')(req) },
      },
    },
  };
}
export const EmptyList = (): Node => {
  return (
    <ConnectWebsitesContainer
      generated={genBaseProps({
        whitelist: [],
      })}
    />
  );
};
export const Whitelisted = (): Node => {
  return (
    <ConnectWebsitesContainer
      generated={genBaseProps({
        whitelist: [
          {
            url: 'google.com',
            walletIndex: 0,
          },
          {
            url: 'yoroi.com',
            walletIndex: 1,
          },
        ],
      })}
    />
  );
};
