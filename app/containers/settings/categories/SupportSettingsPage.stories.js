// @flow

import type { Node } from 'react';
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
  title: `${__filename.split('.')[0]}`,
  component: SupportSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
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
