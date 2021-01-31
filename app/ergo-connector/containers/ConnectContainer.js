// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import ConnectPage from '../components/connect/ConnectPage';
import { getWalletsInfo } from '../../../chrome/extension/background';
import { observer } from 'mobx-react';
import { ROUTES } from '../routes-config';

declare var chrome;
type Props = {|
  history: Object,
|};

type State = {|
  accounts?: Array<Object>,
|};

let chromeMessage;

chrome.runtime.sendMessage({ type: 'connect_retrieve_data' }, function (response) {
  if (response) {
    chromeMessage = response;
  }
});

@observer
export default class ConnectContainer extends Component<Props, State> {
  state: State = {
    accounts: [],
  };

  async componentDidMount() {
    const accounts = await getWalletsInfo();
    if (accounts) {
      this.setState({ accounts });
    }
  }
  onToggleCheckbox: (index: number) => void = index => {
    const { accounts } = this.state;
    if (accounts) {
      const newItems = accounts.slice();
      newItems[index].checked = !newItems[index].checked;
      this.setState({ accounts: newItems });
    }
  };

  handleAllChecked: () => void = event => {
    const { accounts } = this.state;
    if (accounts) {
      // eslint-disable-next-line no-return-assign
      accounts.forEach(item => (item.isChecked = event));
      this.setState({ accounts });
    }
  };

  onConnect(walletIndex: number) {
    chrome.storage.local.get('connector_whitelist', async result => {
      const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
      whitelist.push({ url: chromeMessage.url, walletIndex });
      chrome.storage.local.set({ connector_whitelist: whitelist });
    });
    chrome.runtime.sendMessage({
      type: 'connect_response',
      accepted: true,
      account: walletIndex,
      tabId: chromeMessage.tabId,
    });
    this.props.history.push(ROUTES.DETAILS);
  }

  onCancel() {
    chrome.runtime.sendMessage({
      type: 'connect_response',
      accepted: false,
      tabId: chromeMessage.tabId,
    });
  }

  handleSubmit: () => void = () => {
    const { accounts } = this.state;
    if (accounts) {
      const walletIndex = accounts.findIndex(item => item.checked === true);
      if (walletIndex >= 0) {
        this.onConnect(walletIndex);
      }
    }
  };

  render(): Node {
    const { accounts } = this.state;

    return (
      <ConnectPage
        message={chromeMessage}
        accounts={accounts}
        onConnect={this.onConnect}
        onToggleCheckbox={this.onToggleCheckbox}
        onCancel={this.onCancel}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}
