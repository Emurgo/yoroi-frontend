// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedProps } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';
import MainLayout from '../MainLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import WalletSendForm from '../../components/wallet/WalletSendForm';
import { DECIMAL_PLACES_IN_ADA, MAX_INTEGER_PLACES_IN_ADA } from '../../config/numbersConfig';

@inject('stores', 'actions') @observer
export default class DaedalusTransferPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { uiDialogs } = this.props.stores;
    const { wallets, transactions } = this.props.stores.ada;
    const { actions } = this.props;
    const { isValidAddress } = wallets;
    const { calculateTransactionFee, validateAmount } = transactions;
    /* TODO: Replace with Daedalus transfer workflow */
    if (!wallets.active) return <MainLayout><LoadingSpinner /></MainLayout>;
    return (
      <MainLayout>
        <WalletSendForm
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
          currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
          validateAmount={validateAmount}
          calculateTransactionFee={(receiver, amount) => (
            calculateTransactionFee(wallets.active.id, receiver, amount)
          )}
          addressValidator={isValidAddress}
          isDialogOpen={uiDialogs.isOpen}
          openDialogAction={actions.dialogs.open.trigger}
        />
      </MainLayout>
    );
  }
}
