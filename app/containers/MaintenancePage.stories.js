// @flow

import React from 'react';

import { action } from '@storybook/addon-actions';
import MaintenancePage from './MaintenancePage';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: MaintenancePage,
  decorators: [withScreenshot],
};

export const Generic = () => (
  <MaintenancePage
    generated={{
      handleExternalLinkClick: action('External link click'),
    }}
  />
);
