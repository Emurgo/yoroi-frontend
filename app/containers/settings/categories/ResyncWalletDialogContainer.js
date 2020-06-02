// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { messages } from '../../../components/wallet/settings/ResyncBlock';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';

export type GeneratedData = typeof ResyncWalletDialogContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  publicDeriver: PublicDeriver<>,
|};

const dialogMessages = defineMessages({
  warning: {
    id: 'wallet.settings.resync.warning',
    defaultMessage: '!!!This will also cause failed transactions to disappear as they are not stored on the blockchain.',
  },
});

@observer
export default class ResyncWalletDialogContainer extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.generated.stores.walletSettings.clearHistory.reset();
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.generated.stores.walletSettings.clearHistory.isExecuting) return;
    this.isChecked = !this.isChecked;
  }

  render(): Node {
    const { intl } = this.context;
    const settingsStore = this.generated.stores.walletSettings;

    return (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel)}
        buttonLabel={intl.formatMessage(messages.resyncButtonlabel)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        onSubmit={async () => {
          await this.generated.actions.walletSettings.resyncHistory.trigger({
            publicDeriver: this.props.publicDeriver,
          });
          this.generated.actions.dialogs.closeActiveDialog.trigger();
        }}
        isSubmitting={settingsStore.clearHistory.isExecuting}
        onCancel={this.generated.actions.dialogs.closeActiveDialog.trigger}
        error={settingsStore.clearHistory.error}
      >
        <p>{intl.formatMessage(messages.resyncExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning)}</p>
      </DangerousActionDialog>
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ResyncWalletDialogContainer)} no way to generated props`);
    }
    const { actions, stores } = this.props;
    const settingActions = actions.ada.walletSettings;
    const settingStore = stores.walletSettings;
    return Object.freeze({
      stores: {
        walletSettings: {
          clearHistory: {
            reset: settingStore.clearHistory.reset,
            isExecuting: settingStore.clearHistory.isExecuting,
            error: settingStore.clearHistory.error,
          },
        },
      },
      actions: {
        walletSettings: {
          resyncHistory: { trigger: settingActions.resyncHistory.trigger },
        },
        dialogs: {
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
      },
    });
  }
}
