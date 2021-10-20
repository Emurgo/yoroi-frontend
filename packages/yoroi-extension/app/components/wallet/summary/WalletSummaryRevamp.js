// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import ExportTxToFileSvg from '../../../assets/images/transaction/export.inline.svg';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmountType';
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
import { Button, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';

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
    defaultMessage: '!!!Export to file',
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
  +numberOfTransactions: number,
  +shouldHideBalance: boolean,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
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

  render(): Node {
    const {
      pendingAmount,
      numberOfTransactions,
      isLoadingTransactions,
      openExportTxToFileDialog,
      unitOfAccountSetting,
    } = this.props;
    const { intl } = this.context;

    const content = (
      <Box
        sx={{
          background: 'var(--yoroi-palette-common-white)',
          boxShadow:
            '0 4px 6px 0 #dee2ea, 0 1px 2px 0 rgb(222 226 234 / 82%), 0 2px 4px 0 rgb(222 226 234 / 74%)',
        }}
      >
        {!isLoadingTransactions && (
          <>
            <Box
              sx={{
                padding: '24px 30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h2"
                as="p"
                sx={{ fontWeight: 400, color: 'var(--yoroi-palette-gray-600)' }}
              >
                {intl.formatMessage(messages.numOfTxsLabel)}:{' '}
                <Typography
                  variant="h2"
                  as="span"
                  sx={{ fontWeight: 400, color: 'var(--yoroi-palette-gray-900)' }}
                >
                  {numberOfTransactions}
                </Typography>
              </Typography>
              <Button
                variant="ternary"
                sx={{
                  textTransform: 'capitalize',
                  svg: {
                    marginRight: '16px',
                  },
                }}
                onClick={openExportTxToFileDialog}
                onKeyPress={openExportTxToFileDialog}
              >
                <ExportTxToFileSvg />
                {intl.formatMessage(messages.exportIconTooltip)}
              </Button>
            </Box>
            {(!pendingAmount.incoming.isEmpty() || !pendingAmount.outgoing.isEmpty()) && (
              <Box sx={{ padding: '16px 30px' }}>
                {!pendingAmount.incoming.isEmpty() && (
                  <div className={styles.pendingConfirmation}>
                    {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                    :&nbsp;
                    {pendingAmount.incomingInSelectedCurrency && unitOfAccountSetting.enabled ? (
                      <span className={styles.amount}>
                        {formatValue(pendingAmount.incomingInSelectedCurrency)}
                        {' ' + unitOfAccountSetting.currency}
                      </span>
                    ) : (
                      <>
                        <span className={styles.amount}>
                          {this.renderAmountDisplay({
                            shouldHideBalance: this.props.shouldHideBalance,
                            amount: pendingAmount.incoming,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                )}
                {!pendingAmount.outgoing.isEmpty() && (
                  <div className={styles.pendingConfirmation}>
                    {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                    :&nbsp;
                    {pendingAmount.outgoingInSelectedCurrency && unitOfAccountSetting.enabled ? (
                      <span className={styles.amount}>
                        {formatValue(pendingAmount.outgoingInSelectedCurrency)}
                        {' ' + unitOfAccountSetting.currency}
                      </span>
                    ) : (
                      <>
                        <span className={styles.amount}>
                          {this.renderAmountDisplay({
                            shouldHideBalance: this.props.shouldHideBalance,
                            amount: pendingAmount.outgoing,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </Box>
            )}
          </>
        )}
        <Box
          sx={{
            display: 'flex',
            padding: '20px 30px 10px',
          }}
        >
          <Label variant="body2" flex="1 1 40%">
            {intl.formatMessage(messages.typeSection)}
          </Label>
          <Label variant="body2" flex="1 1 30%" align="center">
            {intl.formatMessage(messages.statusSection)}
          </Label>
          <Label variant="body2" flex="1 1 30%" align="center">
            {intl.formatMessage(globalMessages.feeLabel)}
          </Label>
          <Label variant="body2" flex="1 1 30%" align="center">
            {intl.formatMessage(globalMessages.amountLabel)}
          </Label>
        </Box>
      </Box>
    );

    return content;
  }
}

const Label = styled(Typography)({
  color: 'var(--yoroi-palette-gray-600)',
});
