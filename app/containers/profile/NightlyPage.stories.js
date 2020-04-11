// @flow

import React from 'react';

import { action } from '@storybook/addon-actions';
import NightlyPage from './NightlyPage';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: NightlyPage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <NightlyPage
    generated={{
      actions: {
        profile: {
          acceptNightly: { trigger: action('acceptNightly') },
        }
      }
    }}
  />
);

/* ===== Notable variations ===== */
