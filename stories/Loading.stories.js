import React from 'react';

import { storiesOf } from '@storybook/react';

import Loading from '../app/components/loading/Loading';
import { UnableToLoadError } from '../app/i18n/errors';

const story = storiesOf('Loading', module);

/* Normal */
story.add('Normal', () => (
  <Loading
    hasLoadedCurrentLocale
    hasLoadedCurrentTheme
    isLoadingDataForNextScreen
    onExternalLinkClick={() => {}}
    downloadLogs={() => {}}
  />), {
  notes: 'Normal Loading'
});

/* Error while loading */
story.add('Error while loading', () => (
  <Loading
    hasLoadedCurrentLocale
    hasLoadedCurrentTheme
    isLoadingDataForNextScreen={false}
    onExternalLinkClick={() => {}}
    downloadLogs={() => {}}
    error={new UnableToLoadError()}
  />), {
  notes: 'Error while loading'
});
