// @flow
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
import { Routes } from './Routes';
import { yoroiPolymorphTheme } from './themes/PolymorphThemes';
import { themeOverrides } from './themes/overrides/index';
import translations from './i18n/translations';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import ThemeManager from './ThemeManager';
import environment from './environment';
import { hot } from 'react-hot-loader';

import { THEMES } from './themes/index';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru, ...de, ...fr]);

@observer
class App extends Component<{
  stores: StoresMap,
  actions: ActionsMap,
  history: Object,
}> {

  mobxDevToolsInstanceIfDevEnv(): ?React$Element<any> {
    if (!environment.isDev()) return undefined;
    try {
      const mobxDevToolsPackage = require('mobx-react-devtools').default;
      return React.createElement(mobxDevToolsPackage);
    } catch (err) {
      return undefined;
    }
  }

  // temporary method
  handleChange = (e: { target: { checked: boolean } }) => {
    const { stores } = this.props;
    const currentTheme = stores.profile.currentTheme;
    const theme = currentTheme === THEMES.YOROI_CLASSIC
      ? THEMES.YOROI_MODERN
      : THEMES.YOROI_CLASSIC;
    this.props.actions.theme.changeTheme.trigger({ theme: e.target.checked });
    this.props.actions.profile.updateTheme.trigger({ theme });
  }

  setMarkup = () => {
    const { stores } = this.props;
    const currentTheme = stores.profile.currentTheme;
    this.props.actions.theme.changeTheme.trigger({ theme: currentTheme === THEMES.YOROI_CLASSIC });
  }

  render() {
    const { stores, actions, history } = this.props;
    const locale = stores.profile.currentLocale;

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    const themeVars = stores.profile.currentThemeVars;
    const currentTheme = stores.profile.currentTheme;
    const mobxDevTools = this.mobxDevToolsInstanceIfDevEnv();
    // console.log('stores.theme.classic', stores.theme.classic);

    return (
      <div style={{ height: '100%' }}>
        <ThemeManager
          variables={themeVars}
          setMarkup={this.setMarkup}
          // temporary variables
          handleChange={this.handleChange}
          classic={stores.theme.classic}
        />

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
        {mobxDevTools}
      </div>
    );
  }
}

export default hot(module)(App);
