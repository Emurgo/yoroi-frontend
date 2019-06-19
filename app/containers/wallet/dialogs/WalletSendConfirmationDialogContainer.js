// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../../../environment';
import type { InjectedProps } from '../../../types/injectedPropsType';
import type { BaseSignRequest } from '../../../api/ada/adaTypes';
import {
  copySignRequest,
  signRequestFee,
  signRequestReceivers,
  signRequestTotalInput,
} from '../../../api/ada/lib/utils';
import WalletSendConfirmationDialog from '../../../components/wallet/send/WalletSendConfirmationDialog';
import {
  formattedWalletAmount,
  formattedAmountToNaturalUnits,
} from '../../../utils/formatters';

type DialogProps = {
  signRequest: BaseSignRequest,
  currencyUnit: string,
  staleTx: boolean,
};
type Props = InjectedProps & DialogProps;

@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  render() {
    const {
      actions, currencyUnit,
      signRequest, stores,
    } = this.props;
    const { wallets } = this.props.stores.substores[environment.API];
    const { sendMoneyRequest } = wallets;
    const activeWallet = wallets.active;
    const { profile } = stores;
    const { sendMoney } = this.props.actions[environment.API].wallets;

    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

    const totalInput = signRequestTotalInput(signRequest, true);
    const fee = signRequestFee(signRequest, true);
    const receivers = signRequestReceivers(signRequest, false);
    return (
      <WalletSendConfirmationDialog
        staleTx={this.props.staleTx}
        selectedExplorer={this.props.stores.profile.selectedExplorer}
        amount={formattedWalletAmount(totalInput.minus(fee))}
        receivers={receivers}
        totalAmount={formattedWalletAmount(totalInput)}
        transactionFee={formattedWalletAmount(fee)}
        amountToNaturalUnits={formattedAmountToNaturalUnits}
        signRequest={signRequest}
        onSubmit={({ password }) => {
          const copyRequest = copySignRequest(signRequest);
          sendMoney.trigger({
            signRequest: copyRequest,
            password,
          });
        }}
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
