// @flow

import type { Node } from 'react';
import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ServerStatusErrors } from '../../../types/serverStatusErrorType';
import ComplexityLevelSettingsPage from './ComplexityLevelSettingsPage';
import { withScreenshot } from 'storycap';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import {
  walletLookup,
} from '../../../../stories/helpers/StoryWrapper';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: ComplexityLevelSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.LEVEL_OF_COMPLEXITY,
      selected: null,
      ...lookup,
    }),
    (<ComplexityLevelSettingsPage
      generated={{
        stores: {
          profile: {
            setComplexityLevelRequest: {
              isExecuting: boolean('isExecuting', false),
              error: null,
            },
            complexityLevel: select('complexityLevel', ComplexityLevels, ComplexityLevels.Simple),
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
            selectComplexityLevel: { trigger: async (req) => action('selectComplexityLevel')(req) },
          }
        }
      }}
    />)
  );
};
