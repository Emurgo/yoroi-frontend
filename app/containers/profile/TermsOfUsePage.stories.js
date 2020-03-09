// @flow

import React from 'react';

import { select, boolean, } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import TermsOfUsePage from './TermsOfUsePage';
import { withScreenshot } from 'storycap';
import { getTermsOfUse } from '../../stores/toplevel/ProfileStore';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';

export default {
  title: `${module.id.split('.')[1]}`,
  component: TermsOfUsePage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <TermsOfUsePage
    generated={{
      stores: {
        profile: {
          setTermsOfUseAcceptanceRequest: {
            isExecuting: boolean('isExecuting', false),
            error: null,
          },
          termsOfUse: getTermsOfUse(globalKnobs.locale()),
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
          acceptTermsOfUse: { trigger: async () => action('acceptTermsOfUse')() },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */
