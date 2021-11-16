// @flow
import type { Node } from 'react';
import { Component } from 'react';
import ConnectPage from '../components/connect/ConnectPage';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type {
  PublicDeriverCache,
  ConnectingMessage,
  WhitelistEntry,
  ConnectResponseData,
} from '../../../chrome/extension/ergo-connector/types';
import { LoadingWalletStates } from '../types';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import { genLookupOrFail, } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import { WalletChecksum } from '@emurgo/cip4-js';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import ConnectorStore from '../stores/ConnectorStore';

type GeneratedData = typeof ConnectContainer.prototype.generated;
declare var chrome;

type State = {|
  selected: number,
  deriver: ?PublicDeriver<>,
  checksum: ?WalletChecksum,
|};

@observer
export default class ConnectContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>,
  State
> {
  state: State = {
    selected: -1,
    deriver: null,
    checksum: null,
  };

  onUnload: (SyntheticEvent<>) => void = ev => {
    ev.preventDefault();
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    chrome.runtime.sendMessage({
      type: 'connect_response',
      accepted: false,
      tabId: chromeMessage?.tabId,
    });
  };

  componentDidMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    this.generated.actions.connector.getConnectorWhitelist.trigger();
    window.addEventListener('unload', this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener('unload', this.onUnload);
  }

  onToggleCheckbox: (deriver: PublicDeriver<>, checksum: ?WalletChecksum) => void = (deriver, checksum) => {
    const index = deriver.getPublicDeriverId();
    this.setState((prevState) => prevState.selected === index
      ? { selected: -1, deriver: null, checksum: null }
      : { selected: index, deriver, checksum }
    );
  };

  async onConnect(deriver: PublicDeriver<>, checksum: ?WalletChecksum) {
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    if(chromeMessage == null) {
      throw new Error(`${nameof(chromeMessage)} connecting to a wallet but no connect message found`);
    }

    const connector = this.generated.actions.connector;

    const appAuthID = chromeMessage.appAuthID;
    const authEntry = await ConnectorStore
      .createAuthEntry({ appAuthID, deriver, checksum });

    const publicDeriverId = deriver.getPublicDeriverId();
    const result = this.generated.stores.connector.currentConnectorWhitelist;
    const whitelist = result.length ? [...result] : [];
    whitelist.push({
      url: chromeMessage.url,
      publicDeriverId,
      appAuthID,
      auth: authEntry,
    });
    await connector.updateConnectorWhitelist.trigger({ whitelist });

    chrome.runtime.sendMessage(({
      type: 'connect_response',
      accepted: true,
      publicDeriverId,
      auth: authEntry,
      tabId: chromeMessage.tabId,
    }: ConnectResponseData));

    connector.closeWindow.trigger();
  }

  onCancel: void => void = () => {
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    chrome.runtime.sendMessage(({
      type: 'connect_response',
      accepted: false,
      tabId: chromeMessage?.tabId,
    }: ConnectResponseData));

    this.generated.actions.connector.closeWindow.trigger();
  };

  handleSubmit: () => void = () => {
    const wallets = this.generated.stores.connector.wallets;
    if (wallets) {
      const { selected, deriver, checksum } = this.state;
      if (selected >= 0) {
        this.onConnect(deriver, checksum);
      }
    }
  };

  render(): Node {
    const { selected } = this.state;
    const responseMessage = this.generated.stores.connector.connectingMessage;
    const wallets = this.generated.stores.connector.wallets;
    const error = this.generated.stores.connector.errorWallets;
    const loadingWallets = this.generated.stores.connector.loadingWallets;

    return (
      <ConnectPage
        loading={loadingWallets}
        error={error}
        message={responseMessage}
        publicDerivers={wallets}
        onConnect={this.onConnect}
        onToggleCheckbox={this.onToggleCheckbox}
        onCancel={this.onCancel}
        handleSubmit={this.handleSubmit}
        selected={selected}
        network={networks.ErgoMainnet.NetworkName}
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        getResponse: {|
          trigger: (params: void) => Promise<void>,
        |},
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
        closeWindow: {|
          trigger: (params: void) => void,
        |},
        getConnectorWhitelist: {|
          trigger: (params: void) => Promise<void>,
        |},
        updateConnectorWhitelist: {|
          trigger: ({|
            whitelist: Array<WhitelistEntry>,
          |}) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      profile: {|
        shouldHideBalance: boolean,
      |},
      connector: {|
        connectingMessage: ?ConnectingMessage,
        wallets: Array<PublicDeriverCache>,
        currentConnectorWhitelist: Array<WhitelistEntry>,
        errorWallets: string,
        loadingWallets: $Values<typeof LoadingWalletStates>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ConnectContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          shouldHideBalance: stores.profile.shouldHideBalance
        },
        connector: {
          connectingMessage: stores.connector.connectingMessage,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          wallets: stores.connector.wallets,
          errorWallets: stores.connector.errorWallets,
          loadingWallets: stores.connector.loadingWallets,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
      },
      actions: {
        connector: {
          getResponse: { trigger: actions.connector.getResponse.trigger },
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
          closeWindow: { trigger: actions.connector.closeWindow.trigger },
          getConnectorWhitelist: { trigger: actions.connector.getConnectorWhitelist.trigger },
          updateConnectorWhitelist: { trigger: actions.connector.updateConnectorWhitelist.trigger },
        },
      },
    });
  }
}
