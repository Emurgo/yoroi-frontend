// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import moment from 'moment';
import styles from './WalletTransactionsList.scss';
import Transaction from './Transaction';
import WalletTransaction from '../../../domain/WalletTransaction';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import type { AssuranceMode } from '../../../types/transactionAssuranceTypes';
import { Logger } from '../../../utils/logging';

const messages = defineMessages({
  today: {
    id: 'wallet.summary.page.todayLabel',
    defaultMessage: '!!!Today',
    description: 'Label for the "Today" label on the wallet summary page.',
  },
  yesterday: {
    id: 'wallet.summary.page.yesterdayLabel',
    defaultMessage: '!!!Yesterday',
    description: 'Label for the "Yesterday" label on the wallet summary page.',
  },
  showMoreTransactionsButtonLabel: {
    id: 'wallet.summary.page.showMoreTransactionsButtonLabel',
    defaultMessage: '!!!Show more transactions',
    description: 'Label for the "Show more transactions" button on the wallet summary page.',
  },
});

const dateFormat = 'YYYY-MM-DD';

type Props = {
  transactions: Array<WalletTransaction>,
  isLoadingTransactions: boolean,
  hasMoreToLoad: boolean,
  assuranceMode: AssuranceMode,
  walletId: string,
  formattedWalletAmount: Function,
  onLoadMore: Function,
};

@observer
export default class WalletTransactionsList extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  componentWillMount() {
    this.localizedDateFormat = moment.localeData().longDateFormat('L');
    // Localized dateFormat:
    // English - MM/DD/YYYY
    // Japanese - YYYY/MM/DD
  }

  list: HTMLElement;
  loadingSpinner: ?LoadingSpinner;
  localizedDateFormat: 'MM/DD/YYYY';

  groupTransactionsByDay(transactions: Array<WalletTransaction>)
      : Array<{date: string, transactions: Array<WalletTransaction>}> {
    const groups = [];
    for (const transaction of transactions) {
      const date = moment(transaction.date).format(dateFormat);
      // find the group this transaction belongs in
      let group = groups.find((g) => g.date === date);
      // if first transaltion in this group, create the group
      if (!group) {
        group = { date, transactions: [] };
        groups.push(group);
      }
      group.transactions.push(transaction);
    }
    return groups.sort(
      (a, b) => b.transactions[0].date.getTime() - a.transactions[0].date.getTime()
    );
  }

  localizedDate(date: string) {
    const { intl } = this.context;
    const today = moment().format(dateFormat);
    if (date === today) return intl.formatMessage(messages.today);
    const yesterday = moment().subtract(1, 'days').format(dateFormat);
    if (date === yesterday) return intl.formatMessage(messages.yesterday);
    return moment(date).format(this.localizedDateFormat);
  }

  getTransactionKey(transactions: Array<WalletTransaction>): string {
    if (transactions.length) {
      const firstTransaction = transactions[0];
      return firstTransaction.id + '-' + firstTransaction.type;
    }
    // this branch should not happen
    Logger.error(
      '[WalletTransactionsList::getTransactionKey] tried to render empty transaction group'
    );
    return '';
  }

  render() {
    const { intl } = this.context;
    const {
      transactions,
      isLoadingTransactions,
      hasMoreToLoad,
      assuranceMode,
      walletId,
      formattedWalletAmount,
      onLoadMore
    } = this.props;

    const buttonClasses = classnames([
      'primary',
      styles.showMoreTransactionsButton,
    ]);

    const transactionsGroups = this.groupTransactionsByDay(transactions);

    const loadingSpinner = isLoadingTransactions ? (
      <LoadingSpinner ref={(component) => { this.loadingSpinner = component; }} />
    ) : null;

    return (
      <div className={styles.component}>
        {transactionsGroups.map(group => (
          <div className={styles.group} key={walletId + '-' + this.getTransactionKey(group.transactions)}>
            <div className={styles.groupDate}>{this.localizedDate(group.date)}</div>
            <div className={styles.list}>
              {group.transactions.map((transaction, transactionIndex) => (
                <div key={`${walletId}-${transaction.id}-${transaction.type}`}>
                  <Transaction
                    data={transaction}
                    isLastInList={transactionIndex === group.transactions.length - 1}
                    state={transaction.state}
                    assuranceLevel={transaction.getAssuranceLevelForMode(assuranceMode)}
                    formattedWalletAmount={formattedWalletAmount}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {loadingSpinner}
        {hasMoreToLoad &&
          <Button
            disabled={isLoadingTransactions}
            className={buttonClasses}
            label={intl.formatMessage(messages.showMoreTransactionsButtonLabel)}
            onClick={onLoadMore}
            skin={ButtonSkin}
          />
        }
      </div>
    );
  }

}
