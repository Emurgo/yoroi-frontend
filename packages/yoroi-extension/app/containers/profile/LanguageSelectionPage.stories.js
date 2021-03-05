// @flow

import type { Node } from 'react';
import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../i18n/translations';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { THEMES } from '../../themes';
import LanguageSelectionPage from './LanguageSelectionPage';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: LanguageSelectionPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => (
  <LanguageSelectionPage
    generated={{
      stores: {
        wallets: {
          selected: null,
        },
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy,
          ),
        }
      },
      actions: {
        profile: {
          resetLocale: { trigger: async (req) => action('resetLocale')(req) },
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */

export const NonTier1 = (): Node => (
  <LanguageSelectionPage
    generated={{
      stores: {
        wallets: {
          selected: null,
        },
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          // note: hardcode a non-tier1 here. Doesn't actually change storybook language
          currentLocale: 'ko-KR',
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy,
          ),
        }
      },
      actions: {
        profile: {
          resetLocale: { trigger: async (req) => action('resetLocale')(req) },
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

export const IsExecuting = (): Node => (
  <LanguageSelectionPage
    generated={{
      stores: {
        wallets: {
          selected: null,
        },
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: true,
          },
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        serverConnectionStore: {
          checkAdaServerStatus: select(
            'checkAdaServerStatus',
            ServerStatusErrors,
            ServerStatusErrors.Healthy,
          ),
        }
      },
      actions: {
        profile: {
          resetLocale: { trigger: async (req) => action('resetLocale')(req) },
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

export const ServerError = (): Node => (
  <LanguageSelectionPage
    generated={{
      stores: {
        wallets: {
          selected: null,
        },
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        serverConnectionStore: {
          checkAdaServerStatus: ServerStatusErrors.Network,
        },
      },
      actions: {
        profile: {
          resetLocale: { trigger: async (req) => action('resetLocale')(req) },
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);
