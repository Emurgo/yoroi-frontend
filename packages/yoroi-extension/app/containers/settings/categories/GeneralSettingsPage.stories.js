// @flow

import type { Node } from 'react';

import { boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../../i18n/translations';
import GeneralSettingsPage from './GeneralSettingsPage';
import { withScreenshot } from 'storycap';
import { globalKnobs } from '../../../../stories/helpers/StoryWrapper';
import { walletLookup } from '../../../../stories/helpers/WalletCache';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';
import { SUPPORTED_CURRENCIES } from '../../../config/unitOfAccount';

export default {
  title: `${__filename.split('.')[0]}`,
  component: GeneralSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  const lookup = walletLookup([]);

  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.GENERAL,
      selected: null,
      ...lookup,
    }),
    // $FlowFixMe[incompatible-type]: extra props added for revamp
    <GeneralSettingsPage
      generated={{
        stores: {
          profile: {
            setProfileLocaleRequest: {
              isExecuting: false,
              error: undefined,
            },
            LANGUAGE_OPTIONS: LANGUAGES,
            currentLocale: globalKnobs.locale(),
            currentTheme: globalKnobs.currentTheme(),
            hasCustomTheme: () => boolean('hasCustomTheme', false),

            UNIT_OF_ACCOUNT_OPTIONS: SUPPORTED_CURRENCIES,
            unitOfAccount: {
              enabled: false,
              currency: undefined,
            },
            setUnitOfAccountRequest: {
              error: null,
              isExecuting: boolean('setUnitOfAccountRequest_isExecuting'),
            },
            coinPriceStore: {
              getCurrentPrice: (_from, _to) => '5',
              lastUpdateTimestamp: Date.now(),
              refreshCurrentUnit: {
                isExecuting: false,
              },
            },
          },
        },
        actions: {
          profile: {
            updateLocale: { trigger: async req => action('updateLocale')(req) },
            updateTheme: { trigger: async req => action('updateTheme')(req) },
            exportTheme: { trigger: async req => action('exportTheme')(req) },
            updateUnitOfAccount: { trigger: async (req) => action('updateUnitOfAccount')(req) },
          },
        },
      }}
    />
  );
};

/* ===== Notable variations ===== */
