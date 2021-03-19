// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import ConnectWebsitesPage from '../components/connect-websites/ConnectWebsitesPage';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type {
  PublicDeriverCache,
  WhitelistEntry,
} from '../../../chrome/extension/ergo-connector/types';
import { LoadingWalletStates } from '../types';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout'
import FullscreenLayout from '../../components/layout/FullscreenLayout'
import { genLookupOrFail, } from '../../stores/stateless/tokenHelpers';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';

type GeneratedData = typeof ConnectWebsitesContainer.prototype.generated;

@observer
export default class ConnectWebsitesContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  async componentDidMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    this.generated.actions.connector.refreshActiveSites.trigger();
    await this.generated.actions.connector.getConnectorWhitelist.trigger();
  }

  onRemoveWallet: ?string => void = url => {
    if(url == null) {
      throw new Error(`Removing a wallet from whitelist but there's no url`);
    };
    this.generated.actions.connector.removeWalletFromWhitelist.trigger(url);
  };

  render(): Node {
    const wallets = this.generated.stores.connector.wallets;
    const loadingWallets = this.generated.stores.connector.loadingWallets;
    const error = this.generated.stores.connector.errorWallets;
    const isLoading = (
      loadingWallets === LoadingWalletStates.IDLE || loadingWallets === LoadingWalletStates.PENDING
    );
    const isSuccess = loadingWallets === LoadingWalletStates.SUCCESS;
    const isError = loadingWallets === LoadingWalletStates.REJECTED;

    if (isLoading) {
      return (
        <FullscreenLayout bottomPadding={0}>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </FullscreenLayout>
      );
    }
    if (isError) {
      return <p>{error}</p>;
    }
    if (isSuccess) {
      return (
        <ConnectWebsitesPage
          accounts={this.generated.stores.connector.currentConnectorWhitelist}
          wallets={wallets}
          onRemoveWallet={this.onRemoveWallet}
          activeSites={this.generated.stores.connector.activeSites.sites}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        />
      );
    }
    return <></>;
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
        refreshActiveSites: {|
          trigger: (params: void) => Promise<void>,
        |},
        removeWalletFromWhitelist: {|
          trigger: (params: string) => Promise<void>,
        |},
        getConnectorWhitelist: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      connector: {|
        wallets: ?Array<PublicDeriverCache>,
        currentConnectorWhitelist: ?Array<WhitelistEntry>,
        loadingWallets: $Values<typeof LoadingWalletStates>,
        errorWallets: string,
        activeSites: {| sites: Array<string> |},
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
      throw new Error(`${nameof(ConnectWebsitesContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        connector: {
          wallets: stores.connector.wallets,
          currentConnectorWhitelist: stores.connector.currentConnectorWhitelist,
          loadingWallets: stores.connector.loadingWallets,
          errorWallets: stores.connector.errorWallets,
          activeSites: stores.connector.activeSites,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        },
      },
      actions: {
        connector: {
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
          refreshActiveSites: { trigger: actions.connector.refreshActiveSites.trigger },
          removeWalletFromWhitelist: {
            trigger: actions.connector.removeWalletFromWhitelist.trigger,
          },
          getConnectorWhitelist: { trigger: actions.connector.getConnectorWhitelist.trigger },
        },
      },
    });
  }
}
