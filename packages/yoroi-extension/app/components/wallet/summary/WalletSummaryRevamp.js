// @flow
import type { Node } from 'react';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmountType';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSummary.scss';
import { formatValue } from '../../../utils/unit-of-account';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import { Button, Typography } from '@mui/material';
import { Box } from '@mui/system';
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
});

type Props = {|
  +numberOfTransactions: number,
  +shouldHideBalance: boolean,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
|};

@observer
export default class WalletSummaryRevamp extends Component<Props> {
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
    if (unitOfAccountSetting.enabled) {
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
            tokenEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals).multipliedBy(price)
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
      numberOfTransactions,
      isLoadingTransactions,
      openExportTxToFileDialog,
    } = this.props;
    const { intl } = this.context;

    const hasPendingAmount = pendingAmount.incoming.length || pendingAmount.outgoing.length;

    const content = (
      <Box id="walletSummary_box" sx={{ background: 'common.white' }}>
        {!isLoadingTransactions && (
          <>
            <Box
              sx={{
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h2"
                as="p"
                fontSize="18px"
                sx={{ fontWeight: 500, color: 'common.black' }}
              >
                {intl.formatMessage({ id: 'wallet.summary.page.transactionsLabel' })}:{' '}
                <Typography
                  variant="h2"
                  as="span"
                  fontSize="18px"
                  sx={{ fontWeight: 500, color: 'common.black' }}
                >
                  {numberOfTransactions}
                </Typography>
              </Typography>
              <Button
                variant="secondary"
                sx={{ textTransform: 'uppercase', margin: '2px' }}
                onClick={openExportTxToFileDialog}
                onKeyPress={openExportTxToFileDialog}
                disabled={isLoadingTransactions}
              >
                {intl.formatMessage({ id: 'wallet.transaction.export.exportIcon.tooltip' })}
              </Button>
            </Box>
            <Box sx={{ padding: hasPendingAmount ? '16px 30px' : 0 }}>
              <Typography variant="body1">
                {this.renderPendingAmount(
                  pendingAmount.incoming,
                  intl.formatMessage(messages.pendingIncomingConfirmationLabel)
                )}
              </Typography>
              <Typography variant="body1">
                {this.renderPendingAmount(
                  pendingAmount.outgoing,
                  intl.formatMessage(messages.pendingOutgoingConfirmationLabel)
                )}
              </Typography>
            </Box>
          </>
        )}
        <Box
          sx={{
            display: 'flex',
            padding: '12px 0',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ ...columnTXStyles.transactionType, maxWidth: '35%' }}>
            {intl.formatMessage({ id: 'wallet.summary.page.type' })}
          </Typography>
          <Typography variant="body2" sx={columnTXStyles.status}>
            {intl.formatMessage({ id: 'wallet.summary.page.status' })}
          </Typography>
          <Typography variant="body2" sx={columnTXStyles.fee}>
            {intl.formatMessage(globalMessages.feeLabel)}
          </Typography>
          <Typography variant="body2" sx={{ ...columnTXStyles.amount, maxWidth: '30%' }}>
            {intl.formatMessage(globalMessages.amountLabel)}
          </Typography>
        </Box>
      </Box>
    );

    return content;
  }
}

export const columnTXStyles = {
  transactionType: { flex: '1 1 30%', maxWidth: '30%', textAlign: 'left', color: 'grayscale.600' },
  status: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'left', color: 'grayscale.600' },
  fee: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'right', color: 'grayscale.600' },
  amount: { flex: '1 1 25%', maxWidth: '25%', textAlign: 'right', color: 'grayscale.600' },
};
