// @flow

import React, { Component } from 'react';
import type { Node } from 'react';
import ConnectWebsitesPage from '../components/connect-websites/ConnectWebsitesPage';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type {
  AccountInfo,
  WhitelistEntry,
} from '../../../chrome/extension/ergo-connector/types';

type GeneratedData = typeof ConnectWebsitesContainer.prototype.generated;

@observer
export default class ConnectWebsitesContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  async componentDidMount() {
    this.generated.actions.connector.getWallets.trigger();
    await this.generated.actions.connector.getConnectorWhitelist.trigger();
  }

  onRemoveWallet: string => void = url => {
    this.generated.actions.connector.removeWalletFromWhitelist.trigger(url);
  };

  render(): Node {
    const wallets = this.generated.stores.connector.wallets;
    const loadingWallets = this.generated.stores.connector.loadingWallets;
    const error = this.generated.stores.connector.errorWallets;
    const isLoading = loadingWallets === 'idle' || loadingWallets === 'pending';
    const isSuccess = loadingWallets === 'success';
    const isError = loadingWallets === 'rejected';

    if (isLoading) {
      return <LoadingSpinner />;
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
        />
      );
    }
    return <></>;
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        getWallets: {|
          trigger: (params: void) => void,
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
        wallets: ?Array<AccountInfo>,
        currentConnectorWhitelist: ?Array<WhitelistEntry>,
        loadingWallets: 'idle' | 'pending' | 'success' | 'rejected',
        errorWallets: string,
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
        },
      },
      actions: {
        connector: {
          getWallets: { trigger: actions.connector.getWallets.trigger },
          removeWalletFromWhitelist: {
            trigger: actions.connector.removeWalletFromWhitelist.trigger,
          },
          getConnectorWhitelist: { trigger: actions.connector.getConnectorWhitelist.trigger },
        },
      },
    });
  }
}
