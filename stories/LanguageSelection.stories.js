// @flow

import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LanguageSelectionForm from '../app/components/profile/language-selection/LanguageSelectionForm';
import { LANGUAGES } from '../app/i18n/translations';

const story = storiesOf('LanguageSelection', module);

/* Normal */
story.add('Normal', () => (
  <LanguageSelectionForm
    onSelectLanguage={action('SelectLanguage')}
    onSubmit={action('Submit')}
    isSubmitting={false}
    currentLocale="en-US"
    languages={LANGUAGES}
  />));

/* Submitting */
story.add('Submitting', () => (
  <LanguageSelectionForm
    onSelectLanguage={action('SelectLanguage')}
    onSubmit={action('Submit')}
    isSubmitting
    currentLocale="en-US"
    languages={LANGUAGES}
  />));


/* Korean - Community supported language */
story.add('Korean - Community supported language', () => (
  <LanguageSelectionForm
    onSelectLanguage={action('SelectLanguage')}
    onSubmit={action('Submit')}
    isSubmitting={false}
    currentLocale="ko-KR"
    languages={LANGUAGES}
  />), {
  notes: 'One of the example of Community supported language'
});
