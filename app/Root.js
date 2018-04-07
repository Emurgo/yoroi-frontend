import React, { Component } from 'react';
import { ThemeProvider } from 'react-css-themr';
import { loadRustModule } from 'rust-cardano-crypto';
import Wallet from './containers/wallet/Wallet';
import { IntlProvider } from 'react-intl';
import './themes/index.global.scss';
import { daedalusTheme } from './themes/daedalus';
import translations from './i18n/translations';
import ThemeManager from './ThemeManager';
import { getFakeStores } from './stores/FakeStores';
import actions from './actions';

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    /* (!) Attention: Before use any method from CardanoCrypto
           we must load the RustModule first.
    */
    loadRustModule().then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const currentTheme = 'cardano';
    const locale = "en-US";
    const theme = require(`./themes/daedalus/${currentTheme}.js`); // eslint-disable-line

    if (this.state.loading) {
      return <h1>Loading</h1>;
    }
    const stores = getFakeStores();
    return (
      <div>
        <ThemeManager variables={theme} />
        <div id="provider">
          <ThemeProvider theme={daedalusTheme}>
            <IntlProvider {...{ locale, key: locale, messages: translations[locale] }}>
              <div style={{ height: '100%' }} >
                <Wallet actions={actions} stores={stores} />
              </div>
            </IntlProvider>
          </ThemeProvider>
        </div>
      </div>
    );
  }
}
