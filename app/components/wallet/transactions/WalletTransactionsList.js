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
import type { ExplorerType } from '../../../domain/Explorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import OneSideBarDecoration from '../../widgets/OneSideBarDecoration';
import globalMessages from '../../../i18n/global-messages';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import type { PriceDataRow } from '../../../api/ada/lib/storage/database/prices/tables';
import { getPriceKey } from '../../../api/ada/lib/storage/bridge/prices';

const messages = defineMessages({
  showMoreTransactionsButtonLabel: {
    id: 'wallet.summary.page.showMoreTransactionsButtonLabel',
    defaultMessage: '!!!Show more transactions',
  },
});

const dateFormat = 'YYYY-MM-DD';

type Props = {|
  +transactions: Array<WalletTransaction>,
  +lastSyncBlock: number,
  +memoMap: Map<string, $ReadOnly<TxMemoTableRow>>,
  +priceMap: Map<string, $ReadOnly<PriceDataRow>>,
  +isLoadingTransactions: boolean,
  +hasMoreToLoad: boolean,
  +selectedExplorer: ExplorerType,
  +assuranceMode: AssuranceMode,
  +onLoadMore: void => PossiblyAsync<void>,
  +shouldHideBalance: boolean,
  +onAddMemo: WalletTransaction => void,
  +onEditMemo: WalletTransaction => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
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
      : Array<{|
        date: string,
        transactions: Array<WalletTransaction>,
      |}> {
    const groups: Array<{|
      date: string,
      transactions: Array<WalletTransaction>,
    |}> = [];
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
      return firstTransaction.uniqueKey;
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
      onLoadMore,
      onAddMemo,
      onEditMemo,
    } = this.props;

    const buttonClasses = classnames([
      'primary',
      styles.showMoreTransactionsButton,
    ]);

    const transactionsGroups = this.groupTransactionsByDay(transactions);

    const loadingSpinner = isLoadingTransactions ? (
      <div className={styles.loading}>
        <LoadingSpinner ref={(component) => { this.loadingSpinner = component; }} />
      </div>
    ) : null;

    return (
      <div className={styles.component}>
        {transactionsGroups.map(group => (
          <div className={styles.group} key={`${this.getTransactionKey(group.transactions)}`}>
            <div className={styles.bar}>
              <OneSideBarDecoration>
                <div className={styles.groupDate}>{this.localizedDate(group.date)}</div>
              </OneSideBarDecoration>
            </div>
            <div className={styles.list}>
              {group.transactions.map((transaction, transactionIndex) => (
                <Transaction
                  key={`${transaction.uniqueKey}`}
                  memo={this.props.memoMap.get(transaction.txid)}
                  unitOfAccount={(() => {
                    if (!this.props.unitOfAccountSetting.enabled) {
                      return undefined;
                    }
                    return this.props.priceMap.get(getPriceKey(
                      'ADA',
                      this.props.unitOfAccountSetting.currency,
                      transaction.date,
                    ));
                  })()}
                  selectedExplorer={this.props.selectedExplorer}
                  data={transaction}
                  isLastInList={transactionIndex === group.transactions.length - 1}
                  state={transaction.state}
                  numberOfConfirmations={transaction.block == null
                    ? null
                    : this.props.lastSyncBlock - transaction.block.Height
                  }
                  assuranceLevel={transaction.getAssuranceLevelForMode(
                    assuranceMode,
                    this.props.lastSyncBlock
                  )}
                  onAddMemo={onAddMemo}
                  onEditMemo={onEditMemo}
                  shouldHideBalance={this.props.shouldHideBalance}
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
