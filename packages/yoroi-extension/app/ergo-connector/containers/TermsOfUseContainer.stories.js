// @flow

import React from 'react';
import type { Node } from 'react';
import { withScreenshot } from 'storycap';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { action } from '@storybook/addon-actions';
import TermsOfUseContainer from './TermsOfUseContainer';
import { getTermsOfUse } from '../../stores/base/BaseProfileStore';

export default {
  title: `${__filename.split('.')[0]}`,
  component: TermsOfUseContainer,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  return (
    <TermsOfUseContainer
      history={{
        goBack: action('goBack'),
      }}
      generated={{
        stores: {
          profile: {
            termsOfUse: getTermsOfUse('ada', globalKnobs.locale()),
          },
        },
      }}
    />
  );
};
