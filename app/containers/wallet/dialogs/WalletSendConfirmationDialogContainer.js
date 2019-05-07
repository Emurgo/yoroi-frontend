// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../../../environment';
import resolver from '../../../utils/imports';
import type { InjectedProps } from '../../../types/injectedPropsType';

const WalletSendConfirmationDialog = resolver('components/wallet/send/WalletSendConfirmationDialog');

export type DialogProps = {
  amount: string,
  receiver: string,
  totalAmount: string,
  transactionFee: string,
  amountToNaturalUnits: (amountWithFractions: string) => string,
  currencyUnit: string,
};
type Props = InjectedProps & DialogProps;

@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  handleWalletSendFormSubmit = (values: Object) => {
    this.props.actions[environment.API].wallets.sendMoney.trigger(values);
  };

  render() {
    const {
      actions, amount, receiver, totalAmount,
      transactionFee, amountToNaturalUnits, currencyUnit,
      stores
    } = this.props;
    const { wallets } = this.props.stores.substores[environment.API];
    const { sendMoneyRequest } = wallets;
    const activeWallet = wallets.active;
    const { profile } = stores;

    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

    return (
      <WalletSendConfirmationDialog
        amount={amount}
        receiver={receiver}
        totalAmount={totalAmount}
        transactionFee={transactionFee}
        amountToNaturalUnits={amountToNaturalUnits}
        onSubmit={this.handleWalletSendFormSubmit}
        isSubmitting={sendMoneyRequest.isExecuting}
        onCancel={() => {
          actions.dialogs.closeActiveDialog.trigger();
          sendMoneyRequest.reset();
        }}
        error={sendMoneyRequest.error}
        currencyUnit={currencyUnit}
        classicTheme={profile.isClassicTheme}
      />
    );
  }
}
