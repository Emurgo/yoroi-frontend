// @flow

import React from 'react';

import { select, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import UriPromptPage from './UriPromptPage';
import { THEMES } from '../../themes';
import { withScreenshot } from 'storycap';

export default {
  title: `${module.id.split('.')[1]}`,
  component: UriPromptPage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <UriPromptPage
    generated={{
      stores: {
        profile: {
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
          acceptUriScheme: { trigger: async (req) => action('acceptUriScheme')(req) },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */
