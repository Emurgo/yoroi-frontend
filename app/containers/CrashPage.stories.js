// @flow

import type { Node } from 'react';
import React from 'react';

import { action } from '@storybook/addon-actions';
import CrashPage from './CrashPage';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: CrashPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => (
  <CrashPage
    generated={{
      handleExternalLinkClick: action('External link click'),
    }}
  />
);
