// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../../../environment';
import type { InjectedProps } from '../../../types/injectedPropsType';
import type { BaseSignRequest } from '../../../api/ada/transactions/types';
import {
  copySignRequest,
  IGetFee,
  IReceivers,
  ITotalInput,
} from '../../../api/ada/transactions/utils';
import WalletSendConfirmationDialog from '../../../components/wallet/send/WalletSendConfirmationDialog';
import {
  formattedWalletAmount,
  formattedAmountToNaturalUnits,
} from '../../../utils/formatters';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';

type DialogProps = {|
  +signRequest: BaseSignRequest<RustModule.WalletV2.Transaction | RustModule.WalletV3.InputOutput>,
  +currencyUnit: string,
  +staleTx: boolean,
|};
type Props = {|
  ...InjectedProps,
  ...DialogProps,
|};

@observer
export default class WalletSendConfirmationDialogContainer extends Component<Props> {

  render() {
    const {
      actions, currencyUnit,
      signRequest, stores,
    } = this.props;
    const { wallets } = this.props.stores.substores[environment.API];
    const { sendMoneyRequest } = wallets;
    const publicDeriver = wallets.selected;
    const { profile } = stores;
    const { sendMoney } = this.props.actions[environment.API].wallets;

    if (publicDeriver == null) throw new Error('Active wallet required for WalletSendPage.');

    const totalInput = ITotalInput(signRequest, true);
    const fee = IGetFee(signRequest, true);
    const receivers = IReceivers(signRequest, false);
    return (
      <WalletSendConfirmationDialog
        staleTx={this.props.staleTx}
        selectedExplorer={this.props.stores.profile.selectedExplorer}
        amount={formattedWalletAmount(totalInput.minus(fee))}
        receivers={receivers}
        totalAmount={formattedWalletAmount(totalInput)}
        transactionFee={formattedWalletAmount(fee)}
        amountToNaturalUnits={formattedAmountToNaturalUnits}
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
