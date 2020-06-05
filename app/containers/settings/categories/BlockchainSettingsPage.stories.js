// @flow

import type { Node } from 'react';
import React from 'react';

import { boolean, select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { SUPPORTED_CURRENCIES } from '../../../config/unitOfAccount';
import { withScreenshot } from 'storycap';
import { walletLookup } from '../../../../stories/helpers/StoryWrapper';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';
import { ROUTES } from '../../../routes-config';
import BlockchainSettingsPage from './BlockchainSettingsPage';

export default {
  title: `${__filename.split('.')[0]}`,
  component: BlockchainSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  const lookup = walletLookup([]);

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
      selected: null,
      ...lookup,
    }),
    (<BlockchainSettingsPage
      generated={{
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
          coinPriceStore: {
            getCurrentPrice: (_from, _to) => 5,
            lastUpdateTimestamp: lastUpdatedTimestamp === lastUpdateCases.Never
              ? null
              : new Date().getTime(),
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
      }}
    />)
  );
};
