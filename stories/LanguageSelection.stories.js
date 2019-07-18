import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LanguageSelectionForm from '../app/components/profile/language-selection/LanguageSelectionForm';
import { LANGUAGES } from '../app/i18n/translations';

const story = storiesOf('LanguageSelection', module);
story.add('Init', () => (
  <LanguageSelectionForm
    onSelectLanguage={action('onSelectLanguage')}
    onSubmit={action('submit')}
    isSubmitting={false}
    currentLocale="en-US"
    languages={LANGUAGES}
  />));
