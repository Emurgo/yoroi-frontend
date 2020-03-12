// @flow

import React from 'react';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  walletLookup,
  genSigningWalletWithCache,
} from '../../../stories/helpers/StoryWrapper';
import MyWalletsPage from './MyWalletsPage';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';

export default {
  title: `${module.id.split('.')[1]}`,
  component: MyWalletsPage,
  decorators: [withScreenshot],
};

export const Wallets = () => {
  const wallet = genSigningWalletWithCache();
  const lookup = walletLookup([wallet]);
  const publicDerivers = [wallet.publicDeriver];
  return (<MyWalletsPage
    generated={{
      stores: {
        profile: {
          shouldHideBalance: false,
        },
        wallets: {
          publicDerivers,
          getPublicKeyCache: lookup.getPublicKeyCache
        },
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy,
          ),
        },
        substores: {
          ada: {
            transactions: {
              getTxRequests: lookup.getTransactions,
            },
            walletSettings: {
              getConceptualWalletSettingsCache: lookup.getConceptualWalletSettingsCache,
            },
            delegation: {
              getDelegationRequests: lookup.getDelegation
            },
          },
        },
      },
      actions: {
        profile: {
          updateHideBalance: { trigger: async (req) => action('updateHideBalance')(req) },
        },
        router: {
          goToRoute: { trigger: action('goToRoute') },
        },
        wallets: {
          unselectWallet: { trigger: action('unselectWallet') },
        },
      },
      SidebarContainerProps: {
        generated: {
          stores: {
            topbar: {
              isActiveCategory: (_category) => false,
              categories: [],
            },
            profile: {
              isSidebarExpanded: false,
            },
          },
          actions: {
            profile: {
              toggleSidebar: { trigger: async (req) => action('toggleSidebar')(req) },
            },
            topbar: {
              activateTopbarCategory: { trigger: action('activateTopbarCategory') },
            },
          },
        },
      },
    }}
  />);
};
