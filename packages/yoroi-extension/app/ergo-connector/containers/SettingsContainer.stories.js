// @flow

import React from 'react';
import type { Node } from 'react';
import SettingsContainer from './SettingsContainer';
import { withScreenshot } from 'storycap';
import { LANGUAGES } from '../../i18n/translations';
import { globalKnobs } from '../../../stories/helpers/StoryWrapper';
import { action } from '@storybook/addon-actions';

// dummy router to get links working
import { MemoryRouter } from 'react-router-dom';

export default {
  title: `${__filename.split('.')[0]}`,
  component: SettingsContainer,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  return (
    <MemoryRouter>
      <SettingsContainer
        history={{
          goBack: action('goBack'),
        }}
        generated={{
          stores: {
            profile: {
              setProfileLocaleRequest: {
                isExecuting: false,
                error: undefined,
              },
              LANGUAGE_OPTIONS: LANGUAGES,
              currentLocale: globalKnobs.locale(),
            },
          },
          actions: {
            profile: {
              updateLocale: { trigger: async (req) => action('updateLocale')(req) },
            },
          },
        }}
      />
    </MemoryRouter>
  );
};
