// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import SubmitDelegationPage from '../components/catalyst/SubmitDelegationPage';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';
import type { SubmitDelegationMessage } from '../../../chrome/extension/connector/types.js';
import type LocalizableError from '../../i18n/LocalizableError';

type GeneratedData = typeof SubmitDelegationContainer.prototype.generated;

@observer
export default class SubmitDelegationContainer extends Component<
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
    return this.generated.actions.connector.confirmSubmitDelegation.trigger(password);
  }

  onCancel() {
    window.removeEventListener('unload', this.onUnload);
    this.generated.actions.connector.cancelSubmitDelegation.trigger();
  }

  render(): Node {
    const {
      submitDelegationMessage,
      submitDelegationTxFee,
      submitDelegationError,
      ownVoteKey,
      submitDelegationWalletType,
    } = this.generated.stores.connector;

    if (submitDelegationMessage == null) {
      return null;
    }

    return (
      <SubmitDelegationPage
        favicon={submitDelegationMessage.favicon}
        submitDelegationMessage={submitDelegationMessage}
        submitDelegationTxFee={submitDelegationTxFee}
        submitDelegationError={submitDelegationError}
        ownVoteKey={ownVoteKey}
        submitDelegationWalletType={submitDelegationWalletType}
        onConfirm={this.onConfirm.bind(this)}
        onCancel={this.onCancel.bind(this)}
      />
    );      
  }

  @computed get generated(): {|
    actions: {|
      connector: {|
        confirmSubmitDelegation: {| trigger: (password: ?string) => Promise<void> |},
        cancelSubmitDelegation: {| trigger: () => void |},
        refreshWallets: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      connector: {|
        submitDelegationMessage: ?SubmitDelegationMessage,
        submitDelegationTxFee: ?string,
        submitDelegationError: ?LocalizableError,
        ownVoteKey: ?string,
        submitDelegationWalletType: ?string,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SubmitDelegationContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        connector: {
          submitDelegationMessage: stores.connector.submitDelegationMessage,
          submitDelegationTxFee: stores.connector.submitDelegationTxFee,
          submitDelegationError: stores.connector.submitDelegationError,
          ownVoteKey: stores.connector.ownVoteKey,
          submitDelegationWalletType: stores.connector.submitDelegationWalletType,
        },
      },
      actions: {
        connector: {
          confirmSubmitDelegation: {
            trigger: actions.connector.confirmSubmitDelegation.trigger
          },
          cancelSubmitDelegation: {
            trigger: actions.connector.cancelSubmitDelegation.trigger
          },
          refreshWallets: { trigger: actions.connector.refreshWallets.trigger },
        },
      },
    });
  }
}
