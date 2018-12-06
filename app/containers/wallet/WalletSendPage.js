// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import WalletSendForm from '../../components/wallet/WalletSendForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';
import { DECIMAL_PLACES_IN_ADA, MAX_INTEGER_PLACES_IN_ADA } from '../../config/numbersConfig';
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type { DialogProps } from './dialogs/WalletSendConfirmationDialogContainer';

type Props = InjectedProps;
@observer
export default class WalletSendPage extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { uiDialogs } = this.props.stores;
    const { wallets, transactions } = this.props.stores.substores.ada;
    const { actions } = this.props;
    const { isValidAddress } = wallets;
    const { calculateTransactionFee, validateAmount, hasAnyPending } = transactions;
    const activeWallet = wallets.active;

    // Guard against potential null values
    if (!activeWallet) throw new Error('Active wallet required for WalletSendPage.');

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
        dialogRenderCallback={this.onWebWalletDoConfirmation}
        hasAnyPending={hasAnyPending}
        isTrezorTWallet={activeWallet.isTrezorTWallet}
        onSignWithHardware={(receiver, amount) => {
          actions.ada.trezor.sendWithTrezor.trigger({ receiver, amount });
        }}
      />
    );
  }

  /** Web Wallet Send Confirmation
    * Callback that creates a container to avoid the component knowing about actions/stores */
  onWebWalletDoConfirmation = (dialogProps: DialogProps) => {
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

  /** Trezor Model T Wallet Confirmation
    * Callback that creates a container to avoid the component knowing about actions/stores */
  onTrezorTWalletDoConfirmation = () => {
    return ('TODO: Trezor Sign Tx Confirmation Dialog');
  };
}
