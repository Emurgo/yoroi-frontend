// @flow
import globalMessages from './global-messages';

// This is essentially bulk require

// $FlowFixMe require.context comes from webpack
const req = require.context('./locales', true, /\.json.*$/);
export const translations: { [locale: string]: { [key: string]: string } } = {};

req.keys().forEach((file) => {
  const locale = file.replace('./', '').replace('.json', '');
  translations[locale] = req(file);
});

export const LANGUAGES = [
  {
    value: 'en-US',
    label: globalMessages.languageEnglish,
    svg: require('../assets/images/flags/english.inline.svg') 
  },
  {
    value: 'ja-JP',
    label: globalMessages.languageJapanese,
    svg: require('../assets/images/flags/japanese.inline.svg')
  },
  {
    value: 'ko-KR',
    label: globalMessages.languageKorean,
    svg: require('../assets/images/flags/korean.inline.svg')
  },
  {
    value: 'zh-Hans',
    label: globalMessages.languageChineseSimplified,
    svg: require('../assets/images/flags/chinese.inline.svg')
  },
  {
    value: 'zh-Hant',
    label: globalMessages.languageChineseTraditional,
    svg: require('../assets/images/flags/chinese.inline.svg')
  },
  {
    value: 'ru-RU',
    label: globalMessages.languageRussian,
    svg: require('../assets/images/flags/russian.inline.svg')
  },
  {
    value: 'de-DE',
    label: globalMessages.languageGerman,
    svg: require('../assets/images/flags/german.inline.svg')
  },
  {
    value: 'fr-FR',
    label: globalMessages.languageFrench,
    svg: require('../assets/images/flags/french.inline.svg')
  },
  {
    value: 'es-ES',
    label: globalMessages.languageSpanish,
    svg: require('../assets/images/flags/spanish.inline.svg')
  },
  {
    value: 'it-IT',
    label: globalMessages.languageItalian,
    svg: require('../assets/images/flags/italian.inline.svg')
  },
  {
    value: 'id-ID',
    label: globalMessages.languageIndonesian,
    svg: require('../assets/images/flags/indonesian.inline.svg')
  },
];
