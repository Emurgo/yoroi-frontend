// @flow

import type { Node } from 'react';
import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import ComplexityLevelPage from './ComplexityLevelPage';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: ComplexityLevelPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => (
  <ComplexityLevelPage
    generated={{
      stores: {
        profile: {
          setComplexityLevelRequest: {
            isExecuting: boolean('isExecuting', false),
            error: null,
          },
          complexityLevel: undefined,
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
  />
);
