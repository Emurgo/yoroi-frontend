// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';
import type { InjectedProps } from '../../types/injectedPropsType';
import type { ExplorerType } from '../../domain/Explorer';
import config from '../../config';
import {
  generateStandardPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import environment from '../../environment';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';

type Props = {|
  ...InjectedProps,
  +onNext: void => void,
  +selectedExplorer: ExplorerType,
  +onCancel: void => void,
  +recoveryPhrase: string,
  +classicTheme: boolean,
|};
type WalletRestoreDialogContainerState = {|
  addresses: Array<string>,
  accountPlate: WalletAccountNumberPlate,
  notificationElementId: string,
|}

@observer
export default class YoroiPlatePage extends Component<Props, WalletRestoreDialogContainerState> {

  initializeState = () => {
    const { yoroiTransfer } = this.props.stores.substores.ada;
    const { addresses, accountPlate } = generateStandardPlate(
      yoroiTransfer.recoveryPhrase,
      0, // show addresses for account #0
      5,
      environment.isMainnet()
        ? RustModule.WalletV3.AddressDiscrimination.Production
        : RustModule.WalletV3.AddressDiscrimination.Test,
      true,
    );
    return {
      addresses,
      accountPlate,
      notificationElementId: '',
    };
  }

  state = this.initializeState();

  render() {
    const actions = this.props.actions;
    const { uiNotifications } = this.props.stores;

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };
    const { addresses, accountPlate } = this.state;
    return (
      <WalletRestoreVerifyDialog
        addresses={addresses}
        accountPlate={accountPlate}
        selectedExplorer={this.props.selectedExplorer}
        onCopyAddressTooltip={(address, elementId) => {
          if (!uiNotifications.isOpen(elementId)) {
            this.setState({ notificationElementId: elementId });
            actions.notifications.open.trigger({
              id: elementId,
              duration: tooltipNotification.duration,
              message: tooltipNotification.message,
            });
          }
        }}
        notification={uiNotifications.getTooltipActiveNotification(
          this.state.notificationElementId
        )}
        onNext={this.props.onNext}
        onCancel={this.props.onCancel}
        isSubmitting={false}
        classicTheme={this.props.classicTheme}
        error={undefined}
      />
    );
  }
}
