import React from 'react';
import { configure, addDecorator } from '@storybook/react';

import StoryWrapper from '../stories/helpers/StoryWrapper';

addDecorator(story => {
  return <StoryWrapper>{story}</StoryWrapper>;
});

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
