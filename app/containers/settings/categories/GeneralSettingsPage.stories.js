// @flow

import React from 'react';

import { boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../../i18n/translations';
import GeneralSettingsPage from './GeneralSettingsPage';
import { withScreenshot } from 'storycap';
import { globalKnobs } from '../../../../stories/helpers/StoryWrapper';
import { getVarsForTheme } from '../../../stores/toplevel/ProfileStore';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { getDefaultExplorer } from '../../../domain/Explorer';
import { ROUTES } from '../../../routes-config';

export default {
  title: `Container/${nameof(GeneralSettingsPage)}`,
  component: GeneralSettingsPage,
  decorators: [withScreenshot],
};

// TODO: dynamic change isFirefox/isChrome/isExtension
export const Generic = () => {
  const GenericSymbol = Symbol('Generic');
  return wrapSettings(
    mockSettingsProps({ cacheKey: GenericSymbol, location: ROUTES.SETTINGS.GENERAL }),
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
            updateLocale: { trigger: async () => action('updateLocale')() },
            updateTheme: { trigger: async () => action('updateTheme')() },
            exportTheme: { trigger: async () => action('exportTheme')() },
            updateSelectedExplorer: { trigger: async () => action('updateSelectedExplorer')() },
          },
        },
      }}
    />)
  );
};

/* ===== Notable variations ===== */
