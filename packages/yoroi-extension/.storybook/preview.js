// @flow

import StoryWrapper from '../stories/helpers/StoryWrapper';
import type { StoryDecorator, DecoratorParameters } from '@storybook/react';
import {
  MINIMAL_VIEWPORTS,
} from '@storybook/addon-viewport';
import { RustModule } from '../app/api/ada/lib/cardanoCrypto/rustLoader';

// TODO: storybook and/or react doesn't seem to support top-level async
RustModule.load();

export const parameters: DecoratorParameters = {
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
  },
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      desktopBig: {
        name: 'Big desktop',
        styles: {
          width: '1920px',
          height: '1080px',
        },
        type: 'desktop',
      },
      desktopSmall: {
        name: 'Small desktop',
        styles: {
          width: '1366px',
          height: '768px',
        },
        type: 'desktop',
      },
    },
  },
};

export const decorators: Array<StoryDecorator> = [
  (story => {
    return <StoryWrapper>{story}</StoryWrapper>;
  })
];