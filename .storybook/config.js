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
});

// Global Decorator
addDecorator(story => {
  return <StoryWrapper>{story}</StoryWrapper>;
});

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
