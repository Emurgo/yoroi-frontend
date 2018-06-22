import React, { Component } from 'react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { hashHistory } from 'react-router';
import { loadRustModule } from 'rust-cardano-crypto';
import { ROUTES } from './routes-config';
import './themes/index.global.scss';
import { setupApi } from './api/index';
import { loadLovefieldDB } from './api/ada/lib/lovefieldDatabase';
import createStores from './stores/index';
import actions from './actions/index';
import App from './App';

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
      const api = setupApi();
      const router = new RouterStore();
      this.history = syncHistoryWithStore(hashHistory, router);
      this.stores = createStores(api, actions, router);
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
    return (<App stores={this.stores} actions={actions} history={this.history} />);
  }
}
