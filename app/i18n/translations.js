// @flow
import globalMessages from './global-messages';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import EnglishFlag from '../assets/images/flags/english.inline.svg';
import JapaneseFlag from '../assets/images/flags/japanese.inline.svg';
import KoreanFlag from '../assets/images/flags/korean.inline.svg';
import Chinese from '../assets/images/flags/chinese.inline.svg';
import RussianFlag from '../assets/images/flags/russian.inline.svg';
import GermanFlag from '../assets/images/flags/german.inline.svg';
import FrenchFlag from '../assets/images/flags/french.inline.svg';
import DutchFlag from '../assets/images/flags/dutch.inline.svg';
import BrazilFlag from '../assets/images/flags/brazil.inline.svg';
import SpanishFlag from '../assets/images/flags/spanish.inline.svg';
import ItalianFlag from '../assets/images/flags/italian.inline.svg';
import IndonesianFlag from '../assets/images/flags/indonesian.inline.svg';

// This is essentially bulk require

// $FlowExpectedError[prop-missing] require.context comes from webpack
const req = require.context('./locales', true, /\.json.*$/);
export const translations: { [locale: string]: { [key: string]: string, ... }, ... } = {};

req.keys().forEach((file) => {
  const locale = file.replace('./', '').replace('.json', '');
  translations[locale] = req(file);
});

export type LanguageType = {|
  value: string,
  label: $npm$ReactIntl$MessageDescriptor,
  svg: string,
|};

export const LANGUAGES: Array<LanguageType> = [
  {
    value: 'en-US',
    label: globalMessages.languageEnglish,
    svg: EnglishFlag
  },
  {
    value: 'ja-JP',
    label: globalMessages.languageJapanese,
    svg: JapaneseFlag
  },
  {
    value: 'ko-KR',
    label: globalMessages.languageKorean,
    svg: KoreanFlag
  },
  {
    value: 'zh-Hans',
    label: globalMessages.languageChineseSimplified,
    svg: Chinese
  },
  {
    value: 'zh-Hant',
    label: globalMessages.languageChineseTraditional,
    svg: Chinese
  },
  {
    value: 'ru-RU',
    label: globalMessages.languageRussian,
    svg: RussianFlag
  },
  {
    value: 'de-DE',
    label: globalMessages.languageGerman,
    svg: GermanFlag
  },
  {
    value: 'fr-FR',
    label: globalMessages.languageFrench,
    svg: FrenchFlag
  },
  {
    value: 'nl-NL',
    label: globalMessages.languageDutch,
    svg: DutchFlag
  },
  {
    value: 'pt-BR',
    label: globalMessages.languagePortuguese,
    svg: BrazilFlag
  },
  {
    value: 'es-ES',
    label: globalMessages.languageSpanish,
    svg: SpanishFlag
  },
  {
    value: 'it-IT',
    label: globalMessages.languageItalian,
    svg: ItalianFlag
  },
  {
    value: 'id-ID',
    label: globalMessages.languageIndonesian,
    svg: IndonesianFlag
  },
];
