import React from 'react';

import { storiesOf } from '@storybook/react';

import Loading from '../app/components/loading/Loading';
import CenteredLayout from '../app/components/layout/CenteredLayout';

const story = storiesOf('Loading', module);
story.add('Init', () => (
  <CenteredLayout>
    <Loading
      hasLoadedCurrentLocale={false}
      hasLoadedCurrentTheme={false}
      isLoadingDataForNextScreen={false}
      onExternalLinkClick={() => {}}
      downloadLogs={() => {}}
    />
  </CenteredLayout>), {
  notes: 'This is Loading Init page'
});
