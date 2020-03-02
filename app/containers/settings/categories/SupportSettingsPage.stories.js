// @flow

import React from 'react';

import SupportSettingsPage from './SupportSettingsPage';
import { withScreenshot } from 'storycap';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';

export default {
  title: `Container/${nameof(SupportSettingsPage)}`,
  component: SupportSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const GenericSymbol = Symbol('Generic');
  return wrapSettings(
    mockSettingsProps(GenericSymbol),
    (<SupportSettingsPage
      generated={{
      }}
    />)
  );
};

/* ===== Notable variations ===== */
