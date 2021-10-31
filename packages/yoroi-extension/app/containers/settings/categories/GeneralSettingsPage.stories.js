// @flow

import type { Node } from 'react';

import { boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../../i18n/translations';
import GeneralSettingsPage from './GeneralSettingsPage';
import { withScreenshot } from 'storycap';
import { globalKnobs, } from '../../../../stories/helpers/StoryWrapper';
import { walletLookup } from '../../../../stories/helpers/WalletCache';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';

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
    (<GeneralSettingsPage
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
          },
        },
        actions: {
          profile: {
            updateLocale: { trigger: async (req) => action('updateLocale')(req) },
            updateTheme: { trigger: async (req) => action('updateTheme')(req) },
            exportTheme: { trigger: async (req) => action('exportTheme')(req) },
          },
        },
      }}
    />)
  );
};

/* ===== Notable variations ===== */
