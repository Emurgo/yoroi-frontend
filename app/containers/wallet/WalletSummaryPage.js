// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import {BigNumber} from 'bignumber.js';
import WalletTransactionsList from '../../components/wallet/transactions/WalletTransactionsList';
import WalletSummary from '../../components/wallet/summary/WalletSummary';
import WalletNoTransactions from '../../components/wallet/transactions/WalletNoTransactions';
import VerticalFlexContainer from '../../components/layout/VerticalFlexContainer';
import { DECIMAL_PLACES_IN_ADA } from '../../config/numbersConfig';
import resolver from '../../utils/imports';


const { formattedWalletAmount } = resolver('utils/formatters');

export const messages = defineMessages({
  noTransactions: {
    id: 'wallet.summary.no.transactions',
    defaultMessage: '!!!No recent transactions',
    description:
      'Message shown when wallet has no transactions on wallet summary page.'
  }
});

export default class WalletSummaryPage extends Component {
  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { wallets, transactions } = this.props.stores.ada;
    const {
      hasAny,
      totalAvailable,
      recent,
      recentTransactionsRequest,
      unconfirmedAmount
    } = {
      hasAny: false,
      totalAvailable: undefined,
      recent: undefined,
      recentTransactionsRequest: {},
      unconfirmedAmount: {
        incoming: new BigNumber(10),
        outgoing: new BigNumber(0),
      }
    };
    const wallet = wallets.active;
    // Guard against potential null values
    if (!wallet)
      throw new Error('Active wallet required for WalletSummaryPage.');

    let walletTransactions = null;
    const noTransactionsLabel = intl.formatMessage(messages.noTransactions);

    if (recentTransactionsRequest.isExecutingFirstTime || hasAny) {
      walletTransactions = (
        <WalletTransactionsList
          key={`WalletTransactionsList_${wallet.id}`}
          transactions={recent}
          isLoadingTransactions={recentTransactionsRequest.isExecutingFirstTime}
          hasMoreToLoad={false}
          assuranceMode={wallet.assuranceMode}
          walletId={wallet.id}
          formattedWalletAmount={formattedWalletAmount}
        />
      );
    } else if (!hasAny) {
      walletTransactions = <WalletNoTransactions label={noTransactionsLabel} />;
    }

    return (
      <VerticalFlexContainer>
        <WalletSummary
          walletName={wallet.name}
          amount={wallet.amount.toFormat(DECIMAL_PLACES_IN_ADA)}
          numberOfTransactions={totalAvailable}
          pendingAmount={unconfirmedAmount}
          isLoadingTransactions={recentTransactionsRequest.isExecutingFirstTime}
        />
        {walletTransactions}
      </VerticalFlexContainer>
    );
  }
}
