// @flow
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import pt from 'react-intl/locale-data/pt';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import vi from 'react-intl/locale-data/vi';
import globalMessages from './global-messages';
import type { $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import { ReactComponent as EnglishFlag }  from '../assets/images/flags/english.inline.svg';
import { ReactComponent as JapaneseFlag }  from '../assets/images/flags/japanese.inline.svg';
import { ReactComponent as KoreanFlag }  from '../assets/images/flags/korean.inline.svg';
import { ReactComponent as Chinese }  from '../assets/images/flags/chinese.inline.svg';
import { ReactComponent as RussianFlag }  from '../assets/images/flags/russian.inline.svg';
import { ReactComponent as GermanFlag }  from '../assets/images/flags/german.inline.svg';
import { ReactComponent as FrenchFlag }  from '../assets/images/flags/french.inline.svg';
import { ReactComponent as BrazilFlag }  from '../assets/images/flags/brazil.inline.svg';
import { ReactComponent as SpanishFlag }  from '../assets/images/flags/spanish.inline.svg';
import { ReactComponent as IndonesianFlag }  from '../assets/images/flags/indonesian.inline.svg';
import { ReactComponent as VietnameseFlag }  from '../assets/images/flags/vietnamese.inline.svg';

export const locales: any = Object.freeze([
  ...en,
  ...ko,
  ...ja,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...pt,
  ...id,
  ...es,
  ...vi,
]);

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
    value: 'id-ID',
    label: globalMessages.languageIndonesian,
    svg: IndonesianFlag
  },
  {
    value: 'vi-VN',
    label: globalMessages.languageVietnamese,
    svg: VietnameseFlag
  }
];
