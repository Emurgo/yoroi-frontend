// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import type { MessageDescriptorMap } from 'react-intl';

import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type { DialogProps } from './dialogs/WalletSendConfirmationDialogContainer';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';

const messagesLedger: MessageDescriptorMap = defineMessages({
  infoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
    description: 'Informative message line 1 in the ledger wallet send confirmation dialog.'
  },
  infoLine2: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.2',
    defaultMessage: '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
    description: 'Informative message line 2 in the ledger wallet send confirmation dialog.'
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
    description: 'Label for the send button in the ledger walle send confirmation dialog.'
  },
});

const messagesTrezor: MessageDescriptorMap = defineMessages({
  infoLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
    description: 'Informative message line 1 in the trezor wallet send confirmation dialog.'
  },
  infoLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
    description: 'Informative message line 2 in the trezor wallet send confirmation dialog.'
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
    description: 'Label for the send button in the trezor wallet send confirmation dialog.'
  },
});


type Props = InjectedProps;
@observer
export default class WalletSendPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { wallets, transactions } = this.props.stores.substores.ada;
    const activeWallet = wallets.active;
    // Guard against potential null values
    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

    const { intl } = this.context;
    const { uiDialogs } = this.props.stores;
    const { actions } = this.props;
    const { isValidAddress } = wallets;
    const { calculateTransactionFee, validateAmount, hasAnyPending } = transactions;

    return (
      <WalletSendForm
        currencyUnit={intl.formatMessage(globalMessages.unitAda)}
        currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
        currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
        validateAmount={validateAmount}
        calculateTransactionFee={(receiver, amount) => (
          calculateTransactionFee(activeWallet.id, receiver, amount)
        )}
        addressValidator={isValidAddress}
        isDialogOpen={uiDialogs.isOpen}
        openDialogAction={actions.dialogs.open.trigger}
        webWalletConfirmationDialogRenderCallback={this.webWalletDoConfirmation}
        hardwareWalletConfirmationDialogRenderCallback={this.hardwareWalletDoConfirmation}
        hasAnyPending={hasAnyPending}
        isHardwareWallet={activeWallet.isHardwareWallet}
      />
    );
  }

  /** Web Wallet Send Confirmation dialog
    * Callback that creates a container to avoid the component knowing about actions/stores */
  webWalletDoConfirmation = (dialogProps: DialogProps): Node => {
    const { actions, stores } = this.props;
    return (<WalletSendConfirmationDialogContainer
      actions={actions}
      stores={stores}
      amount={dialogProps.amount}
      receiver={dialogProps.receiver}
      totalAmount={dialogProps.totalAmount}
      transactionFee={dialogProps.transactionFee}
      amountToNaturalUnits={dialogProps.amountToNaturalUnits}
      currencyUnit={dialogProps.currencyUnit}
    />);
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
    * Callback that creates a component to avoid the component knowing about actions/stores
    * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation = (dialogProps: DialogProps): Node => {
    const { active } = this.props.stores.substores[environment.API].wallets;
    // Guard against potential null values
    if (!active) throw new Error('Active wallet required for hardwareWalletDoConfirmation.');

    let hwSendConfirmationDialog: Node = null;
    if (active.isLedgerNanoSWallet) {
      const ledgerSendAction = this.props.actions[environment.API].ledgerSend;
      ledgerSendAction.init.trigger();
      const ledgerSendStore = this.props.stores.substores[environment.API].ledgerSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          amount={dialogProps.amount}
          receiver={dialogProps.receiver}
          totalAmount={dialogProps.totalAmount}
          transactionFee={dialogProps.transactionFee}
          amountToNaturalUnits={dialogProps.amountToNaturalUnits}
          currencyUnit={dialogProps.currencyUnit}
          messages={messagesLedger}
          isSubmitting={ledgerSendStore.isActionProcessing}
          error={ledgerSendStore.error}
          onSubmit={ledgerSendAction.sendUsingLedger.trigger}
          onCancel={ledgerSendAction.cancel.trigger}
        />);
    } else if (active.isTrezorTWallet) {
      const trezorSendAction = this.props.actions[environment.API].trezorSend;
      const trezorSendStore = this.props.stores.substores[environment.API].trezorSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          amount={dialogProps.amount}
          receiver={dialogProps.receiver}
          totalAmount={dialogProps.totalAmount}
          transactionFee={dialogProps.transactionFee}
          amountToNaturalUnits={dialogProps.amountToNaturalUnits}
          currencyUnit={dialogProps.currencyUnit}
          messages={messagesTrezor}
          isSubmitting={trezorSendStore.isActionProcessing}
          error={trezorSendStore.error}
          onSubmit={trezorSendAction.sendUsingTrezor.trigger}
          onCancel={trezorSendAction.cancel.trigger}
        />);
    } else {
      throw new Error('Unsupported hardware wallet found at hardwareWalletDoConfirmation.');
    }

    return hwSendConfirmationDialog;
  };
}
