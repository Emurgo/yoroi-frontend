// @flow

import React from 'react';

import { action } from '@storybook/addon-actions';
import ShutdownPage from './ShutdownPage';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: ShutdownPage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <ShutdownPage
    generated={{
      handleExternalLinkClick: action('External link click'),
    }}
  />
);
