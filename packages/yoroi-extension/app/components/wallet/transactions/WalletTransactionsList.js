// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import { Button } from '@mui/material';
import moment from 'moment';
import styles from './WalletTransactionsList.scss';
import Transaction from './Transaction';
import WalletTransaction from '../../../domain/WalletTransaction';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import type { AssuranceMode } from '../../../types/transactionAssurance.types';
import { Logger } from '../../../utils/logging';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import OneSideBarDecoration from '../../widgets/OneSideBarDecoration';
import globalMessages from '../../../i18n/global-messages';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Notification } from '../../../types/notification.types';
import { genAddressLookup } from '../../../stores/stateless/addressStores';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';

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
  +isLoadingTransactions: boolean,
  +hasMoreToLoad: boolean,
  +selectedExplorer: SelectedExplorer,
  +assuranceMode: AssuranceMode,
  +onLoadMore: void => PossiblyAsync<void>,
  +shouldHideBalance: boolean,
  +onAddMemo: WalletTransaction => void,
  +onEditMemo: WalletTransaction => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
  +addressLookup: ReturnType<typeof genAddressLookup>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +addressToDisplayString: string => string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +complexityLevel: ?ComplexityLevelType,
|};

@observer
export default class WalletTransactionsList extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount(): void {
    this.localizedDateFormat = moment.localeData().longDateFormat('L');
    // Localized dateFormat:
    // English - MM/DD/YYYY
    // Japanese - YYYY/MM/DD
  }

  list: HTMLElement;
  loadingSpinner: ?LoadingSpinner;
  localizedDateFormat: 'MM/DD/YYYY';

  groupTransactionsByDay(
    transactions: Array<WalletTransaction>
  ): Array<{|
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
      let group = groups.find(g => g.date === date);
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

  localizedDate(date: string): string {
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

  render(): Node {
    const { intl } = this.context;
    const {
      transactions,
      isLoadingTransactions,
      hasMoreToLoad,
      assuranceMode,
      onLoadMore,
      onAddMemo,
      onEditMemo,
      notification,
      onCopyAddressTooltip,
    } = this.props;
    const transactionsGroups = this.groupTransactionsByDay(transactions);

    const loadingSpinner = isLoadingTransactions ? (
      <div className={styles.loading}>
        <LoadingSpinner
          ref={component => {
            this.loadingSpinner = component;
          }}
        />
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
                  unitOfAccountSetting={this.props.unitOfAccountSetting}
                  getHistoricalPrice={this.props.getHistoricalPrice}
                  getTokenInfo={this.props.getTokenInfo}
                  selectedExplorer={this.props.selectedExplorer}
                  data={transaction}
                  isLastInList={transactionIndex === group.transactions.length - 1}
                  state={transaction.state}
                  numberOfConfirmations={
                    transaction.block == null
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
                  addressLookup={this.props.addressLookup}
                  notification={notification}
                  onCopyAddressTooltip={onCopyAddressTooltip}
                  addressToDisplayString={this.props.addressToDisplayString}
                  complexityLevel={this.props.complexityLevel}
                />
              ))}
            </div>
          </div>
        ))}
        {loadingSpinner}
        {!isLoadingTransactions && hasMoreToLoad && (
          <Button
            variant="primary"
            disabled={isLoadingTransactions}
            onClick={onLoadMore}
            sx={{ margin: '30px auto', width: '400px', display: 'block' }}
          >
            {intl.formatMessage(messages.showMoreTransactionsButtonLabel)}
          </Button>
        )}
      </div>
    );
  }
}
