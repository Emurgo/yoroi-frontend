import React from 'react';

import { storiesOf } from '@storybook/react';

import Loading from '../app/components/loading/Loading';
import CenteredLayout from '../app/components/layout/CenteredLayout';

storiesOf('Loading', module)
  .add('Init', () => (
    <CenteredLayout>
      <Loading
        hasLoadedCurrentLocale={false}
        hasLoadedCurrentTheme={false}
        isLoadingDataForNextScreen={false}
        onExternalLinkClick={() => {}}
        downloadLogs={() => {}}
      />
    </CenteredLayout>));
