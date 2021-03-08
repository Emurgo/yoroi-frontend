// @flow

import React from 'react';
import type { Node } from 'react';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import AboutContainer from './AboutContainer';

export default {
  title: `${__filename.split('.')[0]}`,
  component: AboutContainer,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  return (
    <AboutContainer
      history={{
        goBack: action('goBack'),
      }}
    />
  );
};
