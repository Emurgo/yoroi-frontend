// @flow

import type { Node } from 'react';

import { select, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { LANGUAGES } from '../../../i18n/translations';
import LanguageSelectorForm from './LanguageSelectorForm';
import StoryWrapper, { globalKnobs } from '../../../../stories/helpers/StoryWrapper';
import { withScreenshot } from 'storycap';

export default {
  title: `${__filename.split('.')[0]}`,
  component: LanguageSelectorForm,
  decorators: [withScreenshot],
};

export const Generic = (): Node => {
  const generated = {
    stores: {
      profile: {
        LANGUAGE_OPTIONS: LANGUAGES,
        isCurrentLocaleSet: false,
        currentLocale: globalKnobs.locale(),
        setProfileLocaleRequest: {
          error: null,
          isExecuting: boolean('isExecuting', false),
        },
      },
    },
    actions: {
      profile: {
        resetLocale: { trigger: async req => action('resetLocale')(req) },
        updateTentativeLocale: { trigger: action('updateTentativeLocale') },
        commitLocaleToStorage: { trigger: async req => action('commitLocaleToStorage')(req) },
      },
    },
  };

  return (
    <LanguageSelectorForm
      onSelectLanguage={lang => console.log(`Selected: ${lang.locale}`)}
      onSubmit={lang => console.log(`Submitted: ${lang.locale}`)}
      isSubmitting={generated.stores.profile.setProfileLocaleRequest.isExecuting}
      currentLocale={generated.stores.profile.currentLocale}
      languages={generated.stores.profile.LANGUAGE_OPTIONS}
      error={generated.stores.profile.setProfileLocaleRequest.error}
    />
  );
};
