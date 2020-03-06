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
import { ROUTES } from '../../../routes-config';

export default {
  title: `Container/${nameof(TermsOfUseSettingsPage)}`,
  component: TermsOfUseSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const GenericSymbol = Symbol('Generic');
  return wrapSettings(
    mockSettingsProps({ cacheKey: GenericSymbol, location: ROUTES.SETTINGS.TERMS_OF_USE }),
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
