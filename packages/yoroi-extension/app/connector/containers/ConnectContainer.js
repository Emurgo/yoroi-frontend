// @flow
import type { Node } from 'react';
import { Component } from 'react';
import ConnectPage from '../components/connect/ConnectPage';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import type { ConnectorStoresAndActionsProps } from '../../types/injectedProps.types';
import type { ConnectResponseData } from '../../../chrome/extension/connector/types';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { LoadingWalletStates } from '../types';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { createAuthEntry } from '../api';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { ampli } from '../../../ampli/index';
import type { WalletState } from '../../../chrome/extension/background/types';

declare var chrome;

type State = {|
  isAppAuth: boolean,
  selectedWallet: {|
    index: number,
    deriver: ?WalletState,
    checksum: ?WalletChecksum,
  |},
|};

@observer
export default class ConnectContainer extends Component<
  ConnectorStoresAndActionsProps,
  State
> {
  state: State = {
    isAppAuth: false,
    selectedWallet: {
      index: -1,
      deriver: null,
      checksum: null,
    },
  };
  onUnload: () => void = () => {
    const chromeMessage = this.props.stores.connector.connectingMessage;
    chrome.runtime.sendMessage({
      type: 'connect_response',
      accepted: false,
      tabId: chromeMessage?.tabId,
    });
  };

  componentDidMount() {
    autorun(() => {
      if (
        this.props.stores.connector.loadingWallets === LoadingWalletStates.SUCCESS
      ) {
        ampli.dappPopupConnectWalletPageViewed({
          wallet_count: this.props.stores.connector.wallets.length,
        });
      }
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.props.actions.connector.refreshWallets.trigger();
    window.addEventListener('beforeunload', this.onUnload);
    window.addEventListener('unload', this.onUnload);
  }

  onConnect: (
    deriver: WalletState,
    checksum: ?WalletChecksum,
    password: ?string
  ) => Promise<void> = async (deriver, checksum, password) => {
    const chromeMessage = this.props.stores.connector.connectingMessage;
    if (chromeMessage == null) {
      throw new Error(
        `${nameof(chromeMessage)} connecting to a wallet but no connect message found`
      );
    }
    const connector = this.props.actions.connector;

    const url = chromeMessage.url;
    const protocol = chromeMessage.protocol;
    const appAuthID = chromeMessage.appAuthID;

    let authEntry;
    if (password != null) {
      authEntry = await createAuthEntry({ appAuthID, deriver, checksum, password });
    } else {
      authEntry = null;
    }

    const { publicDeriverId } = deriver;
    const result = this.props.stores.connector.currentConnectorWhitelist;

    // Removing any previous whitelisted connections for the same url
    const whitelist = (result.length ? [...result] : []).filter(
      e => e.protocol !== protocol || e.url !== url
    );

    whitelist.push({
      url,
      protocol,
      publicDeriverId,
      appAuthID,
      auth: authEntry,
      image: chromeMessage.imgBase64Url,
    });
    await connector.updateConnectorWhitelist.trigger({ whitelist });

    await ampli.dappPopupConnectWalletPasswordPageViewed();

    chrome.runtime.sendMessage(
      ({
        type: 'connect_response',
        accepted: true,
        publicDeriverId,
        auth: authEntry,
        tabId: chromeMessage.tabId,
      }: ConnectResponseData)
    );

    // if we close the window immediately, the previous message may not be able to
    // to reach the service worker
    setTimeout(() => { connector.closeWindow.trigger(); }, 100);
  };

  onSelectWallet: (deriver: WalletState, checksum: ?WalletChecksum) => void = (
    deriver,
    checksum
  ) => {
    const wallets = this.props.stores.connector.wallets;
    if (wallets) {
      const index = deriver.publicDeriverId;
      this.setState(prevState => ({
        ...prevState,
        selectedWallet: {
          index,
          deriver,
          checksum,
        },
      }));
      if (index >= 0 && deriver) {
        if (this.props.stores.connector.connectingMessage?.appAuthID != null) {
          this.setState({ isAppAuth: true });
        } else {
          this.onConnect(deriver, checksum);
        }
      }
    }
  };

  onCancel: void => void = () => {
    const chromeMessage = this.props.stores.connector.connectingMessage;
    chrome.runtime.sendMessage(
      ({
        type: 'connect_response',
        accepted: false,
        tabId: chromeMessage?.tabId,
      }: ConnectResponseData)
    );

    this.props.actions.connector.closeWindow.trigger();
  };

  hidePasswordForm: void => void = () => {
    this.setState({ isAppAuth: false });
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.props.actions.profile.updateHideBalance.trigger();
  };

  render(): Node {
    const responseMessage = this.props.stores.connector.connectingMessage;
    const wallets = this.props.stores.connector.wallets;
    const error = this.props.stores.connector.errorWallets;
    const loadingWallets = this.props.stores.connector.loadingWallets;
    const network = 'Cardano';

    return (
      <ConnectPage
        selectedWallet={this.state.selectedWallet}
        onConnect={this.onConnect}
        onCancel={this.onCancel}
        isAppAuth={this.state.isAppAuth}
        hidePasswordForm={this.hidePasswordForm}
        loading={loadingWallets}
        error={error}
        message={responseMessage}
        publicDerivers={wallets}
        onSelectWallet={this.onSelectWallet}
        network={network}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        shouldHideBalance={this.props.stores.profile.shouldHideBalance}
        unitOfAccount={this.props.stores.profile.unitOfAccount}
        getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
        onUpdateHideBalance={this.updateHideBalance}
      />
    );
  }
}
