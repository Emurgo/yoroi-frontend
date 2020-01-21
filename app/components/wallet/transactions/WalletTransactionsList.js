// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
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
import type { ExplorerType } from '../../../domain/Explorer';
import globalMessages from '../../../i18n/global-messages';

const messages = defineMessages({
  showMoreTransactionsButtonLabel: {
    id: 'wallet.summary.page.showMoreTransactionsButtonLabel',
    defaultMessage: '!!!Show more transactions',
  },
});

const dateFormat = 'YYYY-MM-DD';

type Props = {|
  +transactions: Array<WalletTransaction>,
  +isLoadingTransactions: boolean,
  +hasMoreToLoad: boolean,
  +selectedExplorer: ExplorerType,
  +assuranceMode: AssuranceMode,
  +walletId: string,
  +formattedWalletAmount: BigNumber => string,
  +onLoadMore: void => PossiblyAsync<void>,
|};

@observer
export default class WalletTransactionsList extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
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
    const groups: Array<{
      date: string,
      transactions: Array<WalletTransaction>
    }> = [];
    for (const transaction of transactions) {
      const date: string = moment(transaction.date).format(dateFormat);
      // find the group this transaction belongs in
      let group = groups.find((g) => g.date === date);
      // if first transaction in this group, create the group
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
    if (date === today) return intl.formatMessage(globalMessages.dateToday);
    const yesterday = moment().subtract(1, 'days').format(dateFormat);
    if (date === yesterday) return intl.formatMessage(globalMessages.dateYesterday);
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
                <Transaction
                  key={`${walletId}-${transaction.id}-${transaction.type}`}
                  selectedExplorer={this.props.selectedExplorer}
                  data={transaction}
                  isLastInList={transactionIndex === group.transactions.length - 1}
                  state={transaction.state}
                  assuranceLevel={transaction.getAssuranceLevelForMode(assuranceMode)}
                  formattedWalletAmount={formattedWalletAmount}
                />
              ))}
            </div>
          </div>
        ))}
        {loadingSpinner}
        {!isLoadingTransactions && hasMoreToLoad &&
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
