// @flow
import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import type { Node } from 'react';
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
import nl from 'react-intl/locale-data/nl';
import pt from 'react-intl/locale-data/pt';
import id from 'react-intl/locale-data/id';
import es from 'react-intl/locale-data/es';
import it from 'react-intl/locale-data/it';
import tr from 'react-intl/locale-data/tr';
import { Routes } from './Routes';
import { yoroiPolymorphTheme } from './themes/PolymorphThemes';
import { themeOverrides } from './themes/overrides';
import { translations } from './i18n/translations';
import type { StoresMap } from './stores';
import type { ActionsMap } from './actions';
import { changeToplevelTheme } from './themes';
import ThemeManager from './ThemeManager';
import environment from './environment';
import MaintenancePage from './containers/MaintenancePage';

// https://github.com/yahoo/react-intl/wiki#loading-locale-data
addLocaleData([
  ...en,
  ...ko,
  ...ja,
  ...zh,
  ...ru,
  ...de,
  ...fr,
  ...nl,
  ...pt,
  ...id,
  ...es,
  ...it,
  ...tr,
]);

type Props = {|
  +stores: StoresMap,
  +actions: ActionsMap,
  +history: Object,
|};

@observer
class App extends Component<Props> {
  render(): Node {
    const { stores, } = this.props;
    const locale = stores.profile.currentLocale;

    // Merged english messages with selected by user locale messages
    // In this case all english data would be overridden to user selected locale, but untranslated
    // (missed in object keys) just stay in english
    // eslint-disable-next-line prefer-object-spread
    const mergedMessages: { [key: string]: string, ... } = Object.assign(
      {},
      translations['en-US'],
      translations[locale]
    );

    const themeVars = Object.assign(
      stores.profile.currentThemeVars,
      {
        // show wingdings on dev builds when no font is set to easily find
        // missing font bugs. However, on production, we use Times New Roman
        // which looks ugly but at least it's readable.
        '--default-font': !environment.isProduction() ? 'wingdings' : 'Times New Roman',
      }
    );
    const currentTheme = stores.profile.currentTheme;

    changeToplevelTheme(currentTheme);

    return (
      <div style={{ height: '100%' }}>
        <ThemeManager variables={themeVars} />

        {/* Automatically pass a theme prop to all components in this subtree. */}
        <ThemeProvider
          key={currentTheme}
          theme={yoroiPolymorphTheme}
          themeOverrides={themeOverrides(currentTheme)}
        >
          <IntlProvider {...{ locale, key: locale, messages: mergedMessages }}>
            {this.getContent()}
          </IntlProvider>
        </ThemeProvider>
      </div>
    );
  }

  getContent: void => ?Node = () => {
    const { stores, actions, history } = this.props;
    if (stores.serverConnectionStore.isMaintenance) {
      return (<MaintenancePage stores={stores} actions={actions} />);
    }
    return (
      <Router history={history}>
        {Routes(stores, actions)}
      </Router>
    );
  }
}

export default (hot(App): typeof App);
