// @flow

import type { Node } from 'react';

import { boolean, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withScreenshot } from 'storycap';
import { walletLookup } from '../../../../stories/helpers/WalletCache';
import { genShelleyCip1852DummyWithCache } from '../../../../stories/helpers/cardano/ShelleyCip1852Mocks';
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

const defaultSettingsPageProps: ({|
  selected: null | PublicDeriver<>,
  lastUpdatedTimestamp: null | number,
|}) => * = request => ({
  stores: {
    explorers: {
      setSelectedExplorerRequest: {
        isExecuting: false,
        error: undefined,
      },
      selectedExplorer: defaultToSelectedExplorer(),
      allExplorers: prepackagedExplorers,
    },
    wallets: {
      selected: request.selected,
    },
    profile: {
      isRevampTheme: false,
    },
  },
  actions: {
    explorers: {
      updateSelectedExplorer: { trigger: async req => action('updateSelectedExplorer')(req) },
    },
  },
  canRegisterProtocol: () => boolean('canRegisterProtocol', true),
});

export const Generic = (): Node => {
  const wallet = genShelleyCip1852DummyWithCache();
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
    <BlockchainSettingsPage
      generated={defaultSettingsPageProps({
        selected: wallet.publicDeriver,
        lastUpdatedTimestamp:
          lastUpdatedTimestamp === lastUpdateCases.Never ? null : new Date().getTime(),
      })}
    />
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
    <BlockchainSettingsPage
      generated={defaultSettingsPageProps({
        selected,
        lastUpdatedTimestamp: null,
      })}
    />
  );
};
