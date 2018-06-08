import React, { Component } from 'react';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { hashHistory, Router } from 'react-router';
import { ThemeProvider } from 'react-css-themr';
import { loadRustModule } from 'rust-cardano-crypto';
import { IntlProvider } from 'react-intl';
import { Routes } from './Routes';
import { ROUTES } from './routes-config';
import './themes/index.global.scss';
import { daedalusTheme } from './themes/daedalus';
import translations from './i18n/translations';
import ThemeManager from './ThemeManager';
import { setupApi } from './api/index';
import { loadLovefieldDB } from './api/ada/lib/lovefieldDatabase';
import createStores from './stores/index';
import actions from './actions/index';

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  _redirectToWallet = () => {
    const { app } = this.stores;
    const { wallets } = this.stores.ada;
    // TODO: introduce smarter way to bootsrap initial screens
    if (app.currentRoute === ROUTES.ROOT) {
      if (wallets.first) {
        this.actions.router.goToRoute.trigger({
          route: ROUTES.WALLETS.SUMMARY,
          params: { id: wallets.first.id }
        });
      } else {
        actions.router.goToRoute.trigger({ route: ROUTES.NO_WALLETS });
      }
    }
  };

  componentDidMount() {
    /* (!) Attention: Before use any method from CardanoCrypto
           we must load the RustModule and Lovefield DB first.
    */
    const promises = [];
    promises.push(loadRustModule());
    promises.push(loadLovefieldDB());
    Promise.all(promises).then(() => {
      const api = setupApi();
      const router = new RouterStore();
      this.history = syncHistoryWithStore(hashHistory, router);
      this.stores = createStores(api, actions, router);
      this.setState({ loading: false });
      this._redirectToWallet();
      return true;
    }).catch(() => {
      console.error('Root::loadRustModule unable to load cardano crypto module');
    });
  }

  render() {
    const currentTheme = 'cardano';
    const locale = 'en-US';
    const theme = require(`./themes/daedalus/${currentTheme}.js`); // eslint-disable-line

    if (this.state.loading) {
      return <div />;
    }
    return (
      <div>
        <ThemeManager variables={theme} />
        <Provider stores={this.stores} actions={actions}>
          <ThemeProvider theme={daedalusTheme}>
            <IntlProvider
              {...{ locale, key: locale, messages: translations[locale] }}
            >
              <div style={{ height: '100%' }}>
                <Router history={this.history} routes={Routes} />
              </div>
            </IntlProvider>
          </ThemeProvider>
        </Provider>
      </div>
    );
  }
}
