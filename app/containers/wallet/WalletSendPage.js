// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';

import { 
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import TrezorSendAdaConfirmationDialog from '../../components/wallet/send/trezor/TrezorSendAdaConfirmationDialog';
import type { DialogProps } from './dialogs/WalletSendConfirmationDialogContainer';

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
        trezorTWalletConfirmationDialogRenderCallback={this.trezorTWalletDoConfirmation}
        hasAnyPending={hasAnyPending}
        isTrezorTWallet={activeWallet.isTrezorTWallet}
      />
    );
  }

  /** Web Wallet Send Confirmation dialog
    * Callback that creates a container to avoid the component knowing about actions/stores */
  webWalletDoConfirmation = (dialogProps: DialogProps) => {
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

  /** Trezor Model T Wallet Confirmation dialog
    * Callback that creates a component to avoid the component knowing about actions/stores
    * separate container is not needed, this container acts as container for Confirmation dialog */
  trezorTWalletDoConfirmation = (dialogProps: DialogProps) => { // TODO: fix return type
    const trezorSendAction = this.props.actions[environment.API].trezorSend;
    const trezorSendStore = this.props.stores.substores[environment.API].trezorSend
    return (
      <TrezorSendAdaConfirmationDialog
        amount={dialogProps.amount}
        receiver={dialogProps.receiver}
        totalAmount={dialogProps.totalAmount}
        transactionFee={dialogProps.transactionFee}
        amountToNaturalUnits={dialogProps.amountToNaturalUnits}
        currencyUnit={dialogProps.currencyUnit}
        isSubmitting={trezorSendStore.isActionProcessing}
        error={trezorSendStore.error}
        onSubmit={trezorSendAction.sendUsingTrezor.trigger}
        onCancel={trezorSendAction.cancel.trigger}
      />);
  };
}
