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
import { defaultToSelectedExplorer } from '../../../domain/SelectedExplorer';
import { ROUTES } from '../../../routes-config';
import BlockchainSettingsPage from './BlockchainSettingsPage';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';
import { prepackagedExplorers } from '../../../api/ada/lib/storage/database/prepackaged/explorers';

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
    explorers: {
      setSelectedExplorerRequest: {
        isExecuting: false,
        error: undefined,
      },
      selectedExplorer: defaultToSelectedExplorer(),
      allExplorers: prepackagedExplorers,
    },
    profile: {
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
    explorers: {
      updateSelectedExplorer: { trigger: async (req) => action('updateSelectedExplorer')(req) },
    },
    profile: {
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
