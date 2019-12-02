// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import globalMessages from '../../i18n/global-messages';
import WalletRestoreVerifyDialog from '../../components/wallet/WalletRestoreVerifyDialog';
import type { InjectedProps } from '../../types/injectedPropsType';
import type { ExplorerType } from '../../domain/Explorer';
import config from '../../config';
import {
  generateStandardPlate,
} from '../../api/ada/lib/cardanoCrypto/plate';
import environment from '../../environment';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { PlateResponse } from '../../api/ada/lib/cardanoCrypto/plate';

type Props = {|
  ...InjectedProps,
  +onNext: void => void,
  +selectedExplorer: ExplorerType,
  +onCancel: void => void,
  +recoveryPhrase: string,
  +classicTheme: boolean,
|};
type WalletRestoreDialogContainerState = {|
  byronPlate: void | PlateResponse,
  shelleyPlate: void | PlateResponse,
  notificationElementId: string,
|}

const NUMBER_OF_VERIFIED_ADDRESSES = 1;
const NUMBER_OF_VERIFIED_ADDRESSES_PAPER = 5;

@observer
export default class YoroiPlatePage extends Component<Props, WalletRestoreDialogContainerState> {

  initializeState = () => {
    const { yoroiTransfer } = this.props.stores.substores.ada;

    const numAddresses = yoroiTransfer.isPaper
      ? NUMBER_OF_VERIFIED_ADDRESSES_PAPER
      : NUMBER_OF_VERIFIED_ADDRESSES;

    const byronPlate = generateStandardPlate(
      yoroiTransfer.recoveryPhrase,
      0, // show addresses for account #0
      numAddresses,
      environment.isMainnet()
        ? RustModule.WalletV3.AddressDiscrimination.Production
        : RustModule.WalletV3.AddressDiscrimination.Test,
      true,
    );
    const shelleyPlate = yoroiTransfer.isPaper
      ? undefined
      : generateStandardPlate(
        yoroiTransfer.recoveryPhrase,
        0, // show addresses for account #0
        numAddresses,
        environment.isMainnet()
          ? RustModule.WalletV3.AddressDiscrimination.Production
          : RustModule.WalletV3.AddressDiscrimination.Test,
        false,
      );
    return {
      byronPlate,
      shelleyPlate,
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
    const { byronPlate, shelleyPlate } = this.state;
    return (
      <WalletRestoreVerifyDialog
        byronPlate={byronPlate}
        shelleyPlate={shelleyPlate}
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
