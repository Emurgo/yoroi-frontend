// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import environment from '../../../environment';
import WalletTrezorSendConfirmationDialog from '../../../components/wallet/send/trezor/WalletTrezorSendConfirmationDialog';
import type { InjectedDialogContainerProps } from '../../../types/injectedPropsType';

export type DialogProps = {
  amount: string,
  receiver: string,
  totalAmount: string,
  transactionFee: string,
  currencyUnit: string,
  amountToNaturalUnits: (amountWithFractions: string) => string,
  onSendUsingTrezor: Function,
};

type Props = InjectedDialogContainerProps & DialogProps;
@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  render() {
    const {
      actions,
      amount,
      receiver,
      totalAmount,
      transactionFee,
      currencyUnit,
      amountToNaturalUnits,
      onSendUsingTrezor,
      onClose,
    } = this.props;
    const { wallets } = this.props.stores.substores[environment.API];
    const { sendMoneyRequest } = wallets; // TODO: use trezorSignTx request or ??

    const activeWallet = wallets.active;
    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

    return (
      <WalletTrezorSendConfirmationDialog
        amount={amount}
        receiver={receiver}
        totalAmount={totalAmount}
        transactionFee={transactionFee}
        amountToNaturalUnits={amountToNaturalUnits}
        currencyUnit={currencyUnit}
        isSubmitting={sendMoneyRequest.isExecuting}  // TODO: use trezorSignTx request or ??
        error={sendMoneyRequest.error}
        onSubmit={onSendUsingTrezor}
        onCancel={this.onCancel} // TODO: fix this
      />
    );
  }

  onCancel = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  }
}
