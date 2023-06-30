// @flow
import globalMessages from './global-messages';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { ReactComponent as EnglishFlag }  from '../assets/images/flags/english.inline.svg';
import { ReactComponent as JapaneseFlag }  from '../assets/images/flags/japanese.inline.svg';
import { ReactComponent as KoreanFlag }  from '../assets/images/flags/korean.inline.svg';
import { ReactComponent as Chinese }  from '../assets/images/flags/chinese.inline.svg';
import { ReactComponent as RussianFlag }  from '../assets/images/flags/russian.inline.svg';
import { ReactComponent as GermanFlag }  from '../assets/images/flags/german.inline.svg';
import { ReactComponent as FrenchFlag }  from '../assets/images/flags/french.inline.svg';
import { ReactComponent as DutchFlag }  from '../assets/images/flags/dutch.inline.svg';
import { ReactComponent as BrazilFlag }  from '../assets/images/flags/brazil.inline.svg';
import { ReactComponent as SpanishFlag }  from '../assets/images/flags/spanish.inline.svg';
import { ReactComponent as ItalianFlag }  from '../assets/images/flags/italian.inline.svg';
import { ReactComponent as IndonesianFlag }  from '../assets/images/flags/indonesian.inline.svg';
import { ReactComponent as TurkishFlag }  from '../assets/images/flags/turkish.inline.svg';
import { ReactComponent as CzechFlag }  from '../assets/images/flags/czech.inline.svg';
import { ReactComponent as SlovakFlag }  from '../assets/images/flags/slovak.inline.svg';
import { ReactComponent as VietnameseFlag }  from '../assets/images/flags/vietnamese.inline.svg';

// This is essentially bulk require
// $FlowExpectedError[prop-missing] require.context comes from webpack
const req = require.context('./locales', true, /\.json.*$/, 'lazy');
export const translations: {|
  [locale: string]: Promise<{| [key: string]: string, |}>,
|} = {};

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
  {
    value: 'tr-TR',
    label: globalMessages.languageTurkish,
    svg: TurkishFlag
  },
  {
    value: 'cs-CZ',
    label: globalMessages.languageCzech,
    svg: CzechFlag
  },
  {
    value: 'sk-SK',
    label: globalMessages.languageSlovak,
    svg: SlovakFlag
  },
  {
    value: 'vi-VN',
    label: globalMessages.languageVietnamese,
    svg: VietnameseFlag
  }
];

// Getting the names of the required locales from the language definitions
const requiredLocaleNames = [...new Set(LANGUAGES.map(({ value }) => value.split('-')[0]))];
// Dynamically importing the required locales from intl
const importedLocales = requiredLocaleNames.flatMap(name => {
  return require('react-intl/locale-data/' + name);
});

export const locales = Object.freeze(importedLocales);