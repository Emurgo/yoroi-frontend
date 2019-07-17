import React, { Component } from 'react';
import { keys } from 'lodash';
import { observer } from 'mobx-react';
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
import translations from '../../app/i18n/translations';
import { THEMES } from '../../app/themes';
import ThemeManager from '../../app/ThemeManager';
import YoroiClassic from '../../app/themes/prebuilt/YoroiClassic';
import YoroiModern from '../../app/themes/prebuilt/YoroiModern';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru, ...de, ...fr, ...id, ...es, ...it]);

const themes = {
  YoroiClassic,
  YoroiModern
};
const themeNames = keys(themes);

type Props = {
    children: any,
};

type State = {
  themeName: string,
  localeName: string,
};

@observer
export default class StoryWrapper extends Component<Props, State> {
  state = {
    themeName: localStorage.getItem('currentTheme') || themeNames[0],
    localeName: localStorage.getItem('currentLocale') || 'en-US',
  };

  setLocaleName = (localeName: string) => {
    this.setState({ localeName });
    localStorage.setItem('currentLocale', localeName);
  };

  setThemeName = (themeName: string) => {
    this.setState({ themeName });
    localStorage.setItem('currentTheme', themeName);
  };

  render() {
    const { children: Story } = this.props;
    const locale = this.state.localeName;
    const currentTheme = this.state.themeName;

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    const themeVars = Object.assign({}, themes[currentTheme]);

    // Refer: https://github.com/Emurgo/yoroi-frontend/pull/497
    if (document && document.body instanceof HTMLBodyElement) {
      // Flow give error when directly assesing document.body.classList.[remove()]|[add()]
      const bodyClassList = document.body.classList;
      // we can't simply set the className because there can be other classes present
      // therefore we only remove & add those related to the theme
      const allThemes: Array<string> = Object.keys(THEMES).map(key => THEMES[key]);
      bodyClassList.remove(...allThemes);
      bodyClassList.add(currentTheme);
    }

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
