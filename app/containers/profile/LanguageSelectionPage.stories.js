// @flow

import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../i18n/translations';
import Request from '../../stores/lib/LocalizedRequest';
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

export const Generic = () => (
  <LanguageSelectionPage
    generated={{
      stores: {
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          unsetProfileLocaleRequest: new Request(async () => undefined),
          getProfileLocaleRequest: new Request(async () => undefined),
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
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */

export const NonTier1 = () => (
  <LanguageSelectionPage
    generated={{
      stores: {
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          // note: hardcode a non-tier1 here. Doesn't actually change storybook language
          currentLocale: 'ko-KR',
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          unsetProfileLocaleRequest: new Request(async () => undefined),
          getProfileLocaleRequest: new Request(async () => undefined),
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
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

export const IsExecuting = () => (
  <LanguageSelectionPage
    generated={{
      stores: {
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: true,
          },
          unsetProfileLocaleRequest: new Request(async () => undefined),
          getProfileLocaleRequest: new Request(async () => undefined),
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
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);

export const ServerError = () => (
  <LanguageSelectionPage
    generated={{
      stores: {
        profile: {
          LANGUAGE_OPTIONS: LANGUAGES,
          isCurrentLocaleSet: false,
          currentLocale: globalKnobs.locale(),
          setProfileLocaleRequest: {
            error: null,
            isExecuting: boolean('isExecuting', false),
          },
          unsetProfileLocaleRequest: new Request(async () => undefined),
          getProfileLocaleRequest: new Request(async () => undefined),
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
        serverConnectionStore: {
          checkAdaServerStatus: ServerStatusErrors.Network,
        },
      },
      actions: {
        profile: {
          updateTentativeLocale: { trigger: action('updateTentativeLocale') },
          commitLocaleToStorage: { trigger: async (req) => action('commitLocaleToStorage')(req) },
        }
      }
    }}
  />
);
