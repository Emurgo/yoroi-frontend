// @flow

import React from 'react';

import SupportSettingsPage from './SupportSettingsPage';
import { withScreenshot } from 'storycap';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import { ROUTES } from '../../../routes-config';

export default {
  title: `Container/${nameof(SupportSettingsPage)}`,
  component: SupportSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const GenericSymbol = Symbol('Generic');
  return wrapSettings(
    mockSettingsProps({ cacheKey: GenericSymbol, location: ROUTES.SETTINGS.SUPPORT }),
    (<SupportSettingsPage
      generated={{
      }}
    />)
  );
};

/* ===== Notable variations ===== */
