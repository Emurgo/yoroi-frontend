// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
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
  oldTheme: boolean
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
      onLoadMore,
      oldTheme
    } = this.props;

    const buttonClasses = classnames([
      'primary',
      styles.showMoreTransactionsButton,
    ]);
    const componentClasses = oldTheme ? styles.componentOld : styles.component;
    const groupClasses = oldTheme ? styles.groupOld : styles.group;
    const groupDateClasses = oldTheme ? styles.groupDateOld : styles.groupDate;
    const listClasses = oldTheme ? styles.listOld : styles.list;

    const transactionsGroups = this.groupTransactionsByDay(transactions);

    const loadingSpinner = isLoadingTransactions ? (
      <LoadingSpinner ref={(component) => { this.loadingSpinner = component; }} />
    ) : null;

    return (
      <div className={componentClasses}>
        {transactionsGroups.map(group => (
          <div className={groupClasses} key={walletId + '-' + this.getTransactionKey(group.transactions)}>
            <div className={groupDateClasses}>{this.localizedDate(group.date)}</div>
            <div className={listClasses}>
              {group.transactions.map((transaction, transactionIndex) => (
                <Transaction
                  key={`${walletId}-${transaction.id}-${transaction.type}`}
                  data={transaction}
                  isLastInList={transactionIndex === group.transactions.length - 1}
                  state={transaction.state}
                  assuranceLevel={transaction.getAssuranceLevelForMode(assuranceMode)}
                  formattedWalletAmount={formattedWalletAmount}
                  oldTheme={oldTheme}
                />
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
            skin={<SimpleButtonSkin />}
          />
        }
      </div>
    );
  }

}
