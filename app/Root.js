import React, { Component } from 'react';
import { action, useStrict } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { hashHistory } from 'react-router';
import { loadRustModule } from 'rust-cardano-crypto';
import './themes/index.global.scss';
import { setupApi } from './api/index';
import { loadLovefieldDB } from './api/ada/lib/lovefieldDatabase';
import createStores from './stores/index';
import translations from './i18n/translations';
import actions from './actions/index';
import Action from './actions/lib/Action';
import App from './App';

// run MobX in strict mode
useStrict(true);

const api = setupApi();
const router = new RouterStore();
const history = syncHistoryWithStore(hashHistory, router);
const stores = createStores(api, actions, router);
window.icarus = {
  api,
  actions,
  translations,
  stores,
  reset: action(() => {
    Action.resetAllActions();
    createStores(api, actions, router);
  }),
};

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    /* (!) Attention: Before use any method from CardanoCrypto
           we must load the RustModule and Lovefield DB first.
    */
    Promise.all([loadRustModule(), loadLovefieldDB()]).then(() => {
      console.debug('Root::componentDidMount Async modules loaded');
      this.setState({ loading: false });
      return true;
    }).catch((error) => {
      console.error('Root::componentDidMount Unable to load async modules', error);
    });
  }

  render() {
    if (this.state.loading) {
      return <div />;
    }
    return (<App stores={stores} actions={actions} history={history} />);
  }
}
