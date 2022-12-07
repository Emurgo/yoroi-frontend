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
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { WalletChecksum } from '@emurgo/cip4-js';
import { LoadingWalletStates } from '../types';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver';
import { createAuthEntry } from '../api';

type GeneratedData = typeof ConnectContainer.prototype.generated;
declare var chrome;

type State = {|
  isAppAuth: boolean,
  selectedWallet: {|
    index: number,
    deriver: ?PublicDeriver<>,
    checksum: ?WalletChecksum,
  |},
|};

@observer
export default class ConnectContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>,
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
  onUnload: (SyntheticEvent<>) => void = ev => {
    ev.preventDefault();
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    chrome.runtime.sendMessage({
      type: 'connect_response',
      accepted: false,
      tabId: chromeMessage?.tabId,
    });
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    window.addEventListener('unload', this.onUnload);
  }

  onConnect: (
    deriver: PublicDeriver<>,
    checksum: ?WalletChecksum,
    password: ?string
  ) => Promise<void> = async (deriver, checksum, password) => {
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    if (chromeMessage == null) {
      throw new Error(
        `${nameof(chromeMessage)} connecting to a wallet but no connect message found`
      );
    }
    const connector = this.generated.actions.connector;

    const url = chromeMessage.url;
    const protocol = chromeMessage.protocol;
    const appAuthID = chromeMessage.appAuthID;

    let authEntry;
    if (password != null) {
      authEntry = await createAuthEntry({ appAuthID, deriver, checksum, password });
    } else {
      authEntry = null;
    }

    const publicDeriverId = deriver.getPublicDeriverId();
    const result = this.generated.stores.connector.currentConnectorWhitelist;

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

    chrome.runtime.sendMessage(
      ({
        type: 'connect_response',
        accepted: true,
        publicDeriverId,
        auth: authEntry,
        tabId: chromeMessage.tabId,
      }: ConnectResponseData)
    );

    connector.closeWindow.trigger();
  };

  onSelectWallet: (deriver: PublicDeriver<>, checksum: ?WalletChecksum) => void = (
    deriver,
    checksum
  ) => {
    const wallets = this.generated.stores.connector.filteredWallets;
    if (wallets) {
      const index = deriver.getPublicDeriverId();
      this.setState(prevState => ({
        ...prevState,
        selectedWallet: {
          index,
          deriver,
          checksum,
        },
      }));
      if (index >= 0 && deriver) {
        if (this.generated.stores.connector.connectingMessage?.appAuthID != null) {
          this.setState({ isAppAuth: true });
        } else {
          this.onConnect(deriver, checksum);
        }
      }
    }
  };

  onCancel: void => void = () => {
    const chromeMessage = this.generated.stores.connector.connectingMessage;
    chrome.runtime.sendMessage(
      ({
        type: 'connect_response',
        accepted: false,
        tabId: chromeMessage?.tabId,
      }: ConnectResponseData)
    );

    this.generated.actions.connector.closeWindow.trigger();
  };

  hidePasswordForm: void => void = () => {
    this.setState({ isAppAuth: false });
  };

  updateHideBalance: void => Promise<void> = async () => {
    await this.generated.actions.connector.updateHideBalance.trigger();
  };

  render(): Node {
    const responseMessage = this.generated.stores.connector.connectingMessage;
    const wallets = this.generated.stores.connector.filteredWallets;
    const error = this.generated.stores.connector.errorWallets;
    const loadingWallets = this.generated.stores.connector.loadingWallets;
    const protocol = this.generated.stores.connector.protocol;
    const network = protocol === 'ergo' ? 'ERG' : 'Cardano';

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
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
        unitOfAccount={this.generated.stores.profile.unitOfAccount}
        getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
        onUpdateHideBalance={this.updateHideBalance}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
        closeWindow: {|
          trigger: (params: void) => void,
        |},
        updateHideBalance: {|
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
        unitOfAccount: UnitOfAccountSettingType,
      |},
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      connector: {|
        connectingMessage: ?ConnectingMessage,
        filteredWallets: Array<PublicDeriverCache>,
        currentConnectorWhitelist: Array<WhitelistEntry>,
        errorWallets: string,
        loadingWallets: $Values<typeof LoadingWalletStates>,
        protocol: ?string,
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
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
          // todo: import profile store for stablecoin display
        },
        connector: {
          connectingMessage: stores.connector.connectingMessage,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          filteredWallets: stores.connector.filteredWallets,
          errorWallets: stores.connector.errorWallets,
          loadingWallets: stores.connector.loadingWallets,
          protocol: stores.connector.protocol,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
      },
      actions: {
        connector: {
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
          closeWindow: { trigger: actions.connector.closeWindow.trigger },
          updateConnectorWhitelist: { trigger: actions.connector.updateConnectorWhitelist.trigger },
          updateHideBalance: { trigger: actions.profile.updateHideBalance.trigger },
        },
      },
    });
  }
}
