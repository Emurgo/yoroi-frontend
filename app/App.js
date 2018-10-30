// @flow
import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';
import { ThemeProvider } from 'react-css-themr';
import { Router } from 'react-router';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ko from 'react-intl/locale-data/ko';
import ja from 'react-intl/locale-data/ja';
import zh from 'react-intl/locale-data/zh';
import { Routes } from './Routes';
import { yoroiTheme } from './themes/yoroi';
import translations from './i18n/translations';
import type { StoresMap } from './stores/index';
import type { ActionsMap } from './actions/index';
import ThemeManager from './ThemeManager';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([...en, ...ko, ...ja, ...zh]);

@observer
export default class App extends Component<{
  stores: StoresMap,
  actions: ActionsMap,
  history: Object,
}> {
  render() {
    const { stores, actions, history } = this.props;
    const locale = stores.profile.currentLocale;
    const currentTheme = 'yoroi';
    const theme = require(`./themes/prebuilt/${currentTheme}.js`); // eslint-disable-line

    return (
      <div>
        <ThemeManager variables={theme} />
        <Provider stores={stores} actions={actions}>
          {/* Automatically pass a theme prop to all componenets in this subtree. */}
          <ThemeProvider theme={yoroiTheme}>
            <IntlProvider {...{ locale, key: locale, messages: translations[locale] }}>
              <div style={{ height: '100%' }}>
                <Router history={history} routes={Routes} />
              </div>
            </IntlProvider>
          </ThemeProvider>
        </Provider>
      </div>
    );
  }
}
