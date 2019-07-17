import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import LanguageSelectionForm from '../app/components/profile/language-selection/LanguageSelectionForm';
import globalMessages from '../app/i18n/global-messages';

const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: globalMessages.languageEnglish, svg: require('../app/assets/images/flags/english.inline.svg') },
  { value: 'ja-JP', label: globalMessages.languageJapanese, svg: require('../app/assets/images/flags/japanese.inline.svg') },
  { value: 'ko-KR', label: globalMessages.languageKorean, svg: require('../app/assets/images/flags/korean.inline.svg') },
  { value: 'zh-Hans', label: globalMessages.languageChineseSimplified, svg: require('../app/assets/images/flags/chinese.inline.svg') },
  { value: 'zh-Hant', label: globalMessages.languageChineseTraditional, svg: require('../app/assets/images/flags/chinese.inline.svg') },
  { value: 'ru-RU', label: globalMessages.languageRussian, svg: require('../app/assets/images/flags/russian.inline.svg') },
  { value: 'de-DE', label: globalMessages.languageGerman, svg: require('../app/assets/images/flags/german.inline.svg') },
  { value: 'fr-FR', label: globalMessages.languageFrench, svg: require('../app/assets/images/flags/french.inline.svg') },
  { value: 'es-ES', label: globalMessages.languageSpanish, svg: require('../app/assets/images/flags/spanish.inline.svg') },
  { value: 'it-IT', label: globalMessages.languageItalian, svg: require('../app/assets/images/flags/italian.inline.svg') },
  { value: 'id-ID', label: globalMessages.languageIndonesian, svg: require('../app/assets/images/flags/indonesian.inline.svg') },
];

storiesOf('LanguageSelection', module)
  .add('Init', () => (
    <LanguageSelectionForm
      onSelectLanguage={action('onSelectLanguage')}
      onSubmit={action('submit')}
      isSubmitting={false}
      currentLocale="en-US"
      languages={LANGUAGE_OPTIONS}
    />));
