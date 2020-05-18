// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { messages } from '../../../components/wallet/settings/RemoveWallet';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';

export type GeneratedData = typeof RemoveWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: void | PublicDeriver<>,
|};

const dialogMessages = defineMessages({
  warning2: {
    id: 'wallet.settings.delete.warning2',
    defaultMessage: '!!!Please double-check you still have the means to restore access to this wallet. If you cannot, removing the wallet may result in irreversible loss of funds.',
  },
  accept: {
    id: 'wallet.settings.delete.accept',
    defaultMessage: '!!!I still have the means to restore this wallet',
  },
});

@observer
export default class RemoveWalletDialogContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.generated.stores.walletSettings.removeWalletRequest.reset();
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.generated.stores.walletSettings.removeWalletRequest.isExecuting) return;
    this.isChecked = !this.isChecked;
  }

  render(): Node {
    const { intl } = this.context;
    const settingsStore = this.generated.stores.walletSettings;
    const settingsActions = this.generated.actions.walletSettings;

    return (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(dialogMessages.accept)}
        buttonLabel={intl.formatMessage(globalMessages.remove)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        onSubmit={() => this.props.publicDeriver && settingsActions.removeWallet.trigger({
          publicDeriver: this.props.publicDeriver,
        })}
        isSubmitting={settingsStore.removeWalletRequest.isExecuting}
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        error={settingsStore.removeWalletRequest.error}
      >
        <p>{intl.formatMessage(messages.removeExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning2)}</p>
      </DangerousActionDialog>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(RemoveWalletDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    const settingActions = actions.ada.walletSettings;
    const settingStore = stores.substores.ada.walletSettings;
    return Object.freeze({
      stores: {
        walletSettings: {
          removeWalletRequest: {
            reset: settingStore.removeWalletRequest.reset,
            isExecuting: settingStore.removeWalletRequest.isExecuting,
            error: settingStore.removeWalletRequest.error,
          },
        },
      },
      actions: {
        walletSettings: {
          removeWallet: { trigger: settingActions.removeWallet.trigger },
        },
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
