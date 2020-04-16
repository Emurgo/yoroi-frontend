// @flow

import React from 'react';

import TermsOfUseSettingsPage from './TermsOfUseSettingsPage';
import { withScreenshot } from 'storycap';
import { getTermsOfUse } from '../../../stores/toplevel/ProfileStore';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import {
  globalKnobs,
  walletLookup,
} from '../../../../stories/helpers/StoryWrapper';
import { ROUTES } from '../../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: TermsOfUseSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = () => {
  const lookup = walletLookup([]);
  return wrapSettings(
    mockSettingsProps({
      location: ROUTES.SETTINGS.TERMS_OF_USE,
      selected: null,
      ...lookup,
    }),
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
