// @flow

import React, { Component } from 'react';
import { keys } from 'lodash';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import de from 'react-intl/locale-data/de';
import fr from 'react-intl/locale-data/fr';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import it from 'react-intl/locale-data/it';
import { yoroiPolymorphTheme } from '../../app/themes/PolymorphThemes';
import { themeOverrides } from '../../app/themes/overrides';
import { translations, LANGUAGES } from '../../app/i18n/translations';
import ThemeManager from '../../app/ThemeManager';
import YoroiClassic from '../../app/themes/prebuilt/YoroiClassic';
import YoroiModern from '../../app/themes/prebuilt/YoroiModern';
import { changeToplevelTheme } from '../../app/themes';

import { withKnobs, select } from '@storybook/addon-knobs';
import { addDecorator } from '@storybook/react';

/**
 * This whole file is meant to mirror code in App.js
 */

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru, ...de, ...fr, ...id, ...es, ...it]);

addDecorator(withKnobs);

const themes = {
  YoroiModern,
  YoroiClassic
};
const themeNames = keys(themes);

const langCode = LANGUAGES.map(item => item.value);

type Props = {
    +children: any,
};

export default class StoryWrapper extends Component<Props> {

  render() {
    const { children: Story } = this.props;
    const locale = select('Language', langCode, langCode[0]);
    const currentTheme = select('Theme', themeNames, themeNames[0]);

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    const themeVars = Object.assign({}, themes[currentTheme]);

    changeToplevelTheme(currentTheme);

    return (
      <div style={{ height: '100%' }}>
        <ThemeManager variables={themeVars} />

        {/* Automatically pass a theme prop to all componenets in this subtree. */}
        <ThemeProvider
          key={currentTheme}
          theme={yoroiPolymorphTheme}
          themeOverrides={themeOverrides(currentTheme)}
        >
          <IntlProvider {...{ locale, key: locale, messages: mergedMessages }}>
            <Story />
          </IntlProvider>
        </ThemeProvider>
      </div>
    );
  }
}
