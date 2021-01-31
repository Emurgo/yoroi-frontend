// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import ConnectWebsitesPage from '../components/connect-websites/ConnectWebsitesPage';
import { getWalletsInfo } from '../../../chrome/extension/background';

type Props = {||};
type State = {| list: ?any |};

export default class ConnectWebsitesContainer extends Component<Props, State> {
  state: State = {
    list: [],
  };

  componentDidMount() {
    window.chrome.storage.local.get('connector_whitelist', async result => {
      const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
      const accounts = await getWalletsInfo();
      const list = [];
      whitelist.forEach(({ url, walletIndex }) => {
        list.push({
          url,
          wallet: accounts[walletIndex],
        });
      });
      this.setState({ list });
    });
  }

  onRemoveWallet: string => void = url => {
    window.chrome.storage.local.get('connector_whitelist', async result => {
      const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
      window.chrome.storage.local.set({
        connector_whitelist: whitelist.filter(e => e.url !== url),
      });
      this.setState(prev => ({ list: prev.list?.filter(e => e.url !== url) }));
    });
  };

  render(): Node {
    const { list } = this.state;
    return <ConnectWebsitesPage accounts={list} onRemoveWallet={this.onRemoveWallet} />;
  }
}
