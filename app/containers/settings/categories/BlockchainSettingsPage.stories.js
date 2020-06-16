// @flow

import type { Node } from 'react';
import React from 'react';

import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { SUPPORTED_CURRENCIES } from '../../../config/unitOfAccount';
import { withScreenshot } from 'storycap';
import { walletLookup, genDummyWithCache } from '../../../../stories/helpers/StoryWrapper';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';
import { ROUTES } from '../../../routes-config';
import BlockchainSettingsPage from './BlockchainSettingsPage';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';

export default {
  title: `${__filename.split('.')[0]}`,
  component: BlockchainSettingsPage,
  decorators: [withScreenshot],
};

const defaultSettingsPageProps: {|
  selected: null | PublicDeriver<>,
  lastUpdatedTimestamp: null | number,
|} => * = (request) => ({
  stores: {
    profile: {
      setSelectedExplorerRequest: {
        isExecuting: false,
        error: undefined,
      },
      selectedExplorer: getDefaultExplorer(),
      UNIT_OF_ACCOUNT_OPTIONS: SUPPORTED_CURRENCIES,
      unitOfAccount: {
        enabled: false,
        currency: undefined,
      },
      setUnitOfAccountRequest: {
        error: null,
        isExecuting: boolean('setUnitOfAccountRequest_isExecuting'),
      },
    },
    wallets: {
      selected: request.selected,
    },
    coinPriceStore: {
      getCurrentPrice: (_from, _to) => 5,
      lastUpdateTimestamp: request.lastUpdatedTimestamp,
      refreshCurrentUnit: {
        isExecuting: false,
      },
    },
  },
  actions: {
    profile: {
      updateSelectedExplorer: { trigger: async (req) => action('updateSelectedExplorer')(req) },
      updateUnitOfAccount: { trigger: async (req) => action('updateUnitOfAccount')(req) },
    },
  },
  canRegisterProtocol: () => boolean('canRegisterProtocol', true),
});

export const Generic = (): Node => {
  const wallet = genDummyWithCache();
  const lookup = walletLookup([wallet]);

  const lastUpdateCases = {
    Never: 0,
    Recent: 1,
  };
  const lastUpdatedTimestamp = select(
    'currency_lastUpdate',
    lastUpdateCases,
    lastUpdateCases.Never
  );
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.BLOCKCHAIN,
      selected: wallet.publicDeriver,
      ...lookup,
    }),
    (<BlockchainSettingsPage
      generated={defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        lastUpdatedTimestamp: lastUpdatedTimestamp === lastUpdateCases.Never
          ? null
          : new Date().getTime(),
      })}
    />)
  );
};


export const NoWallet = (): Node => {
  const selected = null;
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.BLOCKCHAIN,
      selected,
      ...lookup,
    }),
    (<BlockchainSettingsPage
      generated={defaultSettingsPageProps({
        selected,
        lastUpdatedTimestamp: null,
      })}
    />)
  );
};
