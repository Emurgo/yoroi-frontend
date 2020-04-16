// @flow

import React from 'react';

import { boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../../i18n/translations';
import GeneralSettingsPage from './GeneralSettingsPage';
import { withScreenshot } from 'storycap';
import { globalKnobs, walletLookup } from '../../../../stories/helpers/StoryWrapper';
import { getVarsForTheme } from '../../../stores/toplevel/ProfileStore';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';
import { ROUTES } from '../../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: GeneralSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
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
            setSelectedExplorerRequest: {
              isExecuting: false,
              error: undefined,
            },
            setProfileLocaleRequest: {
              isExecuting: false,
              error: undefined,
            },
            LANGUAGE_OPTIONS: LANGUAGES,
            currentLocale: globalKnobs.locale(),
            selectedExplorer: getDefaultExplorer(),
            currentTheme: globalKnobs.currentTheme(),
            getThemeVars: getVarsForTheme,
            hasCustomTheme: () => boolean('hasCustomTheme', false),
          },
        },
        actions: {
          profile: {
            updateLocale: { trigger: async (req) => action('updateLocale')(req) },
            updateTheme: { trigger: async (req) => action('updateTheme')(req) },
            exportTheme: { trigger: async (req) => action('exportTheme')(req) },
            updateSelectedExplorer: { trigger: async (req) => action('updateSelectedExplorer')(req) },
          },
        },
        canRegisterProtocol: () => boolean('canRegisterProtocol', true),
      }}
    />)
  );
};

/* ===== Notable variations ===== */
