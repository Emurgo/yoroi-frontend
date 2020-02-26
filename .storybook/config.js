// @flow

import React from 'react';
import { configure, addDecorator, addParameters } from '@storybook/react';

import StoryWrapper from '../stories/helpers/StoryWrapper';

// Global Option
addParameters({
  options: {
    /**
     * where to show the addon panel
     * @type {('bottom'|'right')}
     */
    panelPosition: 'right',
  },
  screenshot: {
    viewports: {
      desktopBig: {
        width: 1920,
        height: 1080,
      },
      desktopSmall: {
        width: 1366,
        height: 768,
      },
    }
  }
});

// Global Decorator
addDecorator(story => {
  return <StoryWrapper>{story}</StoryWrapper>;
});

configure(
  [
    // $FlowFixMe comes from Webpack and not nodejs so Flow doesn't find the function
    require.context('../app/components', true, /\.stories\.js$/),
    // $FlowFixMe comes from Webpack and not nodejs so Flow doesn't find the function
    require.context('../app/containers', true, /\.stories\.js$/),
  ],
  module
);
