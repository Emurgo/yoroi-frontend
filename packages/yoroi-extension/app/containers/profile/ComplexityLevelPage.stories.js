// @flow

import type { Node } from 'react';

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

export function Generic(): Node {
  return <ComplexityLevelPage
    generated={{
      stores: {
        wallets: {
          selected: null,
        },
        profile: {
          setComplexityLevelRequest: {
            isExecuting: boolean('isExecuting', false),
            error: null,
          },
          selectedComplexityLevel: undefined,
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
}
