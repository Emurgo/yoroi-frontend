// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ThemeProvider } from 'react-css-themr';
import { Router } from 'react-router';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import ru from 'react-intl/locale-data/ru';
import { Routes } from './Routes';
import { yoroiTheme } from './themes/yoroi';
import { yoroiRenewedTheme } from './themes/yoroiRenewed';
import translations from './i18n/translations';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import ThemeManager from './ThemeManager';
import environment from './environment';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh, ...ru]);

@observer
export default class App extends Component<{
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

  render() {
    const { stores, actions, history } = this.props;
    const locale = stores.profile.currentLocale;

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    const mergedMessages = Object.assign({}, translations['en-US'], translations[locale]);

    // const currentTheme = 'yoroi';
    const currentTheme = 'yoroi-renewed';
    const theme = require(`./themes/prebuilt/${currentTheme}.js`); // eslint-disable-line

    const mobxDevTools = this.mobxDevToolsInstanceIfDevEnv();

    return (
      <div>
        <ThemeManager variables={theme} />
        {/* Automatically pass a theme prop to all componenets in this subtree. */}
        {/* <ThemeProvider theme={yoroiTheme}> */}
        <ThemeProvider theme={yoroiRenewedTheme}>
          <IntlProvider {...{ locale, key: locale, messages: mergedMessages }}>
            <div style={{ height: '100%' }}>
              <Router history={history} routes={Routes(stores, actions)} />
            </div>
          </IntlProvider>
        </ThemeProvider>
        {mobxDevTools}
      </div>
    );
  }
}
