// @flow

import React from 'react';
import type { Node } from 'react';
import { withScreenshot } from 'storycap';
import { action } from '@storybook/addon-actions';
import SupportContainer from './SupportContainer';

export default {
  title: `${__filename.split('.')[0]}`,
  component: SupportContainer,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  return (
    <SupportContainer
      history={{
        goBack: action('goBack'),
      }}
    />
  );
};
