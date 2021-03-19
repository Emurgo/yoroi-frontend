// @flow

import type { Node } from 'react';
import React from 'react';

import TermsOfUseSettingsPage from './TermsOfUseSettingsPage';
import { withScreenshot } from 'storycap';
import { getTermsOfUse } from '../../../stores/base/BaseProfileStore';
import { wrapSettings } from '../../../Routes';
import { mockSettingsProps } from '../Settings.mock';
import {
  globalKnobs,
} from '../../../../stories/helpers/StoryWrapper';
import {
  walletLookup,
} from '../../../../stories/helpers/WalletCache';
import { ROUTES } from '../../../routes-config';

export default {
  title: `${__filename.split('.')[0]}`,
  component: TermsOfUseSettingsPage,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
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
            termsOfUse: getTermsOfUse('ada', globalKnobs.locale()),
          },
        },
      }}
    />)
  );
};

/* ===== Notable variations ===== */
