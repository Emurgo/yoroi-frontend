// @flow

import React from 'react';
import type { Node, ComponentType } from 'react';
import ConnectContainer from './ConnectContainer';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import { LoadingWalletStates } from '../types';
import { select, } from '@storybook/addon-knobs';
import { MemoryRouter } from 'react-router';
import Layout from '../components/layout/Layout';

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
      name: 'Storybook wallet',
      balance: '1234',
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
          connector: {
            connectingMessage: undefined,
            wallets,
            errorWallets,
            loadingWallets: walletsState,
            currentConnectorWhitelist: [],
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
