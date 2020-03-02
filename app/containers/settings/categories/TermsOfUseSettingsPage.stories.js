// @flow

import React from 'react';

import TermsOfUseSettingsPage from './TermsOfUseSettingsPage';
import { withScreenshot } from 'storycap';
import { getTermsOfUse } from '../../../stores/toplevel/ProfileStore';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import {
  globalKnobs,
} from '../../../../stories/helpers/StoryWrapper';

export default {
  title: `Container/${nameof(TermsOfUseSettingsPage)}`,
  component: TermsOfUseSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const GenericSymbol = Symbol('Generic');
  return wrapSettings(
    mockSettingsProps(GenericSymbol),
    (<TermsOfUseSettingsPage
      generated={{
        stores: {
          profile: {
            termsOfUse: getTermsOfUse(globalKnobs.locale()),
          },
        },
      }}
    />)
  );
};

/* ===== Notable variations ===== */
