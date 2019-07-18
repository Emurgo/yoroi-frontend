// @flow
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from 'react-polymorph/lib/components/ThemeProvider';
import { Router } from 'react-router-dom';
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
import { Routes } from './Routes';
import { yoroiPolymorphTheme } from './themes/PolymorphThemes';
import { themeOverrides } from './themes/overrides';
import { translations } from './i18n/translations';
import type { StoresMap } from './stores';
import type { ActionsMap } from './actions';
import { THEMES } from './themes';
import ThemeManager from './ThemeManager';
import environment from './environment';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru, ...de, ...fr, ...id, ...es, ...it]);

@observer
class App extends Component<{
  stores: StoresMap,
  actions: ActionsMap,
  history: Object,
}> {
  render() {
    const { stores, actions, history } = this.props;
    const locale = stores.profile.currentLocale;

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    const themeVars = Object.assign(
      stores.profile.currentThemeVars,
      {
        // show wingdings on dev builds when no font is set to easily find
        // missing font bugshowever, on production, we use Times New Roman
        // which looks ugly but at least it's readable.
        '--default-font': environment.isDev() ? 'wingdings' : 'Times New Roman',
      }
    );
    const currentTheme = stores.profile.currentTheme;

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
            <Router history={history}>
              {Routes(stores, actions)}
            </Router>
          </IntlProvider>
        </ThemeProvider>
      </div>
    );
  }
}

export default hot(App);
