// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import { Component } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { messages } from '../../../components/wallet/settings/ResyncBlock';
import globalMessages from '../../../i18n/global-messages';
import DangerousActionDialog from '../../../components/widgets/DangerousActionDialog';

type Props = {|
  ...StoresAndActionsProps,
  publicDeriverId: number,
|};

const dialogMessages = defineMessages({
  warning: {
    id: 'wallet.settings.resync.warning',
    defaultMessage:
      '!!!This will also cause failed transactions to disappear as they are not stored on the blockchain.',
  },
});

@observer
export default class ResyncWalletDialogContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  componentWillUnmount() {
    this.props.stores.walletSettings.clearHistory.reset();
  }

  @observable isChecked: boolean = false;

  @action
  toggleCheck: void => void = () => {
    if (this.props.stores.walletSettings.clearHistory.isExecuting) return;
    this.isChecked = !this.isChecked;
  };

  render(): Node {
    const { intl } = this.context;
    const settingsStore = this.props.stores.walletSettings;

    return (
      <DangerousActionDialog
        title={intl.formatMessage(messages.titleLabel)}
        checkboxAcknowledge={intl.formatMessage(globalMessages.uriLandingDialogConfirmLabel)}
        isChecked={this.isChecked}
        toggleCheck={this.toggleCheck}
        isSubmitting={settingsStore.clearHistory.isExecuting}
        error={settingsStore.clearHistory.error}
        primaryButton={{
          label: intl.formatMessage(globalMessages.resyncButtonLabel),
          danger: false,
          onClick: async () => {
            await this.props.actions.walletSettings.resyncHistory.trigger({
              publicDeriverId: this.props.publicDeriverId,
            });
            this.props.actions.dialogs.closeActiveDialog.trigger();
          },
        }}
        onCancel={this.props.actions.dialogs.closeActiveDialog.trigger}
        secondaryButton={{
          onClick: this.props.actions.dialogs.closeActiveDialog.trigger,
        }}
        id="resyncWalletDialog"
      >
        <p>{intl.formatMessage(messages.resyncExplanation)}</p>
        <p>{intl.formatMessage(dialogMessages.warning)}</p>
      </DangerousActionDialog>
    );
  }
}
