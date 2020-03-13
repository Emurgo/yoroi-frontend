// @flow

import React from 'react';
import BigNumber from 'bignumber.js';
import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import {
  walletLookup,
  genSigningWalletWithCache,
} from '../../../stories/helpers/StoryWrapper';
import CachedRequest from '../../stores/lib/LocalizedCachedRequest';
import type { GetBalanceFunc } from '../../api/ada/index';
import MyWalletsPage from './MyWalletsPage';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';

export default {
  title: `${module.id.split('.')[1]}`,
  component: MyWalletsPage,
  decorators: [withScreenshot],
};

export const Wallets = () => {

  const genWallet = () => {
    const wallet = genSigningWalletWithCache();

    const pending: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      new BigNumber(3),
    ));
    const executed: CachedRequest<GetBalanceFunc> = new CachedRequest(_request => Promise.resolve(
      new BigNumber(4),
    ));
    executed.execute((null: any));
    executed.execute((null: any));
    const balanceCases = {
      Pending: 0,
      Calculated: 1,
    };
    const getBalanceCase = () => select(
      'balanceCases',
      balanceCases,
      balanceCases.Calculated
    );
    const oldResults = wallet.getTransactions(wallet.publicDeriver);
    wallet.getTransactions = (_req) => ({
      ...oldResults,
      requests: {
        ...oldResults.requests,
        getBalanceRequest: getBalanceCase() === balanceCases.Pending
          ? pending
          : executed,
      },
    });
    return wallet;
  };
  const wallets = [
    genWallet(),
    genWallet(),
    genWallet(),
    genWallet(),
  ];
  const lookup = walletLookup(wallets);
  const publicDerivers = [
    ...wallets.map(cache => cache.publicDeriver),
  ];
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
