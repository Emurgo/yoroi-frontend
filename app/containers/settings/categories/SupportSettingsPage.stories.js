// @flow

import React from 'react';

import SupportSettingsPage from './SupportSettingsPage';
import { withScreenshot } from 'storycap';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';
import {
  walletLookup,
} from '../../../../stories/helpers/StoryWrapper';

export default {
  title: `Container/${nameof(SupportSettingsPage)}`,
  component: SupportSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.SUPPORT,
      selected: null,
      ...lookup,
    }),
    (<SupportSettingsPage
      generated={{
      }}
    />)
  );
};

/* ===== Notable variations ===== */
