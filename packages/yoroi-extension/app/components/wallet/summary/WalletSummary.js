// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import { ReactComponent as ExportTxToFileSvg } from '../../../assets/images/transaction/export-tx-to-file.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmount.types';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSummary.scss';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { formatValue } from '../../../utils/unit-of-account';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import BigNumber from 'bignumber.js';

const messages = defineMessages({
  pendingOutgoingConfirmationLabel: {
    id: 'wallet.summary.page.pendingOutgoingConfirmationLabel',
    defaultMessage: '!!!Outgoing pending confirmation',
  },
  pendingIncomingConfirmationLabel: {
    id: 'wallet.summary.page.pendingIncomingConfirmationLabel',
    defaultMessage: '!!!Incoming pending confirmation',
  },
  numOfTxsLabel: {
    id: 'wallet.summary.page.transactionsLabel',
    defaultMessage: '!!!Number of transactions',
  },
  exportIconTooltip: {
    id: 'wallet.transaction.export.exportIcon.tooltip',
    defaultMessage: '!!!Export',
  },
  dateSection: {
    id: 'wallet.summary.page.dateTime',
    defaultMessage: '!!!Date/time',
  },
  typeSection: {
    id: 'wallet.summary.page.type',
    defaultMessage: '!!!Transaction type',
  },
  statusSection: {
    id: 'wallet.summary.page.status',
    defaultMessage: '!!!Status',
  },
});

type Props = {|
  +shouldHideBalance: boolean,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
|};

@observer
export default class WalletSummary extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  renderAmountDisplay: ({|
    shouldHideBalance: boolean,
    amount: MultiToken,
  |}) => Node = request => {
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  renderPendingAmount(
    timestampedAmount: Array<{| amount: MultiToken, timestamp: number |}>,
    label: string
  ): Node {
    if (!timestampedAmount.length) {
      return null;
    }

    const {
      getHistoricalPrice,
      unitOfAccountSetting,
      shouldHideBalance,
      getTokenInfo,
    } = this.props;

    let pendingAmount = null;
    if (false /* temporarily disabled */ && unitOfAccountSetting.enabled) {
      const { currency } = unitOfAccountSetting;
      if (!currency) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      if (shouldHideBalance) {
        pendingAmount = (
          <>
            <span>{hiddenAmount}</span>
            &nbsp;
            {currency}
          </>
        );
      } else {
        let totalFiatAmount = new BigNumber('0');
        for (const { amount, timestamp } of timestampedAmount) {
          const tokenEntry = amount.getDefaultEntry();
          const tokenInfo = getTokenInfo(tokenEntry);
          const ticker = tokenInfo.Metadata.ticker;
          if (ticker == null) {
            throw new Error('unexpected main token type');
          }

          const price = getHistoricalPrice(ticker, currency, timestamp);
          if (price == null) {
            totalFiatAmount = null;
            break;
          }
          totalFiatAmount = totalFiatAmount.plus(
            tokenEntry.amount
              .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
              .multipliedBy(String(price))
          );
        }
        if (totalFiatAmount) {
          const [beforeDecimal, afterDecimal] = formatValue(totalFiatAmount).split('.');

          pendingAmount = (
            <>
              {beforeDecimal}
              {afterDecimal && <span className={styles.afterDecimal}>.{afterDecimal}</span>}
              &nbsp;
              {currency}
            </>
          );
        }
      }
    }

    if (!pendingAmount) {
      pendingAmount = this.renderAmountDisplay({
        shouldHideBalance,
        amount: timestampedAmount
          .map(({ amount }) => amount)
          .reduce((accuAmount, curAmount) => accuAmount.joinAddCopy(curAmount)),
      });
    }

    return (
      <div className={styles.pendingConfirmation}>
        {label}:&nbsp;
        <span className={styles.amount}>{pendingAmount}</span>
      </div>
    );
  }

  render(): Node {
    const {
      pendingAmount,
      isLoadingTransactions,
      openExportTxToFileDialog,
    } = this.props;
    const { intl } = this.context;

    const content = (
      <div className={styles.content} id="walletSummary_box">
        <div className={styles.leftBlock} />
        <div className={styles.middleBlock}>
          <BorderedBox>
            {!isLoadingTransactions && (
              <>
                {(pendingAmount.incoming.length > 0 || pendingAmount.outgoing.length > 0) && (
                  <div className={styles.pendingSection}>
                    {this.renderPendingAmount(
                      pendingAmount.incoming,
                      intl.formatMessage(messages.pendingIncomingConfirmationLabel)
                    )}
                    {this.renderPendingAmount(
                      pendingAmount.outgoing,
                      intl.formatMessage(messages.pendingOutgoingConfirmationLabel)
                    )}
                  </div>
                )}
              </>
            )}
          </BorderedBox>
        </div>
        <div className={styles.rightBlock}>
          {!isLoadingTransactions ? (
            <span
              className={styles.exportTxToFileSvg}
              title={intl.formatMessage(messages.exportIconTooltip)}
              onClick={openExportTxToFileDialog}
              onKeyPress={openExportTxToFileDialog}
              role="button"
              tabIndex="0"
            >
              <ExportTxToFileSvg />
            </span>
          ) : null}
        </div>
        <div className={styles.sectionList}>
          <div className={classnames([styles.sectionTitle, styles.time])}>
            {intl.formatMessage(messages.dateSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.type])}>
            {intl.formatMessage(messages.typeSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.status])}>
            {intl.formatMessage(messages.statusSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.fee])}>
            {intl.formatMessage(globalMessages.feeLabel)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.amount])}>
            {intl.formatMessage(globalMessages.amountLabel)}
          </div>
        </div>
      </div>
    );

    return <div className={styles.component}>{content}</div>;
  }
}
