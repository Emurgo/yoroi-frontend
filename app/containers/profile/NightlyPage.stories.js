// @flow

import React from 'react';

import { action } from '@storybook/addon-actions';
import { THEMES } from '../../themes';
import NightlyPage from './NightlyPage';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { withScreenshot } from 'storycap';

export default {
  title: `Container/${nameof(NightlyPage)}`,
  component: NightlyPage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <NightlyPage
    generated={{
      stores: {
        profile: {
          isClassicTheme: globalKnobs.currentTheme() === THEMES.YOROI_CLASSIC,
        },
      },
      actions: {
        profile: {
          acceptNightly: { trigger: action('acceptNightly') },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */
