// @flow

import React from 'react';

import TermsOfUseSettingsPage from './TermsOfUseSettingsPage';
import { withScreenshot } from 'storycap';
import { getTermsOfUse } from '../../../stores/toplevel/ProfileStore';
import { globalKnobs } from '../../../../stories/helpers/StoryWrapper';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';

export default {
  title: `Container/${nameof(TermsOfUseSettingsPage)}`,
  component: TermsOfUseSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => wrapSettings(
  mockSettingsProps,
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

/* ===== Notable variations ===== */
