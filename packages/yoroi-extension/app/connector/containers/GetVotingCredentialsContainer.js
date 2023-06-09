// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import GetVotingCredentialsPage from '../components/catalyst/GetVotingCredentialsPage';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type { GetVotingCredentialsMessage } from '../../../chrome/extension/connector/types.js';
import type LocalizableError from '../../i18n/LocalizableError';

type GeneratedData = typeof GetVotingCredentialsContainer.prototype.generated;

@observer
export default class GetVotingCredentialsContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  componentDidMount() {
    this.generated.actions.connector.refreshWallets.trigger();
    window.addEventListener('unload', this.onUnload);
  }

  onUnload: () => void = () => {
    this.onCancel();
  }

  onConfirm(password: ?string): Promise<void> {
    window.removeEventListener('unload', this.onUnload);
    return this.generated.actions.connector.confirmGetVotingCredentials.trigger(password);
  }

  onCancel() {
    window.removeEventListener('unload', this.onUnload);
    this.generated.actions.connector.cancelGetVotingCredentials.trigger();
  }

  render(): Node {
    const {
      getVotingCredentialsMessage,
      getVotingCredentialsError,
      getVotingCredentialsWalletType,
    } = this.generated.stores.connector;

    if (getVotingCredentialsMessage == null) {
      return null;
    }

    return (
      <GetVotingCredentialsPage
        favicon={getVotingCredentialsMessage.favicon}
        url={getVotingCredentialsMessage.requesterUrl}
        error={getVotingCredentialsError}
        onConfirm={this.onConfirm.bind(this)}
        onCancel={this.onCancel.bind(this)}
        walletType={getVotingCredentialsWalletType}
      />
    );      
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        confirmGetVotingCredentials: {| trigger: (password: ?string) => Promise<void> |},
        cancelGetVotingCredentials: {| trigger: () => void |},
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      connector: {|
        getVotingCredentialsMessage: ?GetVotingCredentialsMessage,
        getVotingCredentialsError: ?LocalizableError,
        getVotingCredentialsWalletType: ?string,
    |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(GetVotingCredentialsContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        connector: {
          getVotingCredentialsMessage: stores.connector.getVotingCredentialsMessage,
          getVotingCredentialsError: stores.connector.getVotingCredentialsError,
          getVotingCredentialsWalletType: stores.connector.getVotingCredentialsWalletType,
        },
      },
      actions: {
        connector: {
          confirmGetVotingCredentials: {
            trigger: actions.connector.confirmGetVotingCredentials.trigger
          },
          cancelGetVotingCredentials: {
            trigger: actions.connector.cancelGetVotingCredentials.trigger
          },
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
        },
      },
    });
  }
}
