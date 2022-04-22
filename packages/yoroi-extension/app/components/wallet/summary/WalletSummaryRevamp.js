// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
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
        id='walletSummary_box'
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
                {intl.formatMessage({ id: 'wallet.summary.page.transactionsLabel' })}:{' '}
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
                {intl.formatMessage({ id: 'wallet.transaction.export.exportIcon.tooltip' })}
              </Button>
            </Box>
            {(!pendingAmount.incoming.isEmpty() || !pendingAmount.outgoing.isEmpty()) && (
              <Box sx={{ padding: '16px 30px' }}>
                {!pendingAmount.incoming.isEmpty() && (
                  <div className={styles.pendingConfirmation}>
                    {`${intl.formatMessage({
                      id: 'wallet.summary.page.pendingIncomingConfirmationLabel',
                    })}`}
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
                    {`${intl.formatMessage({
                      id: 'wallet.summary.page.pendingOutgoingConfirmationLabel',
                    })}`}
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
            paddingRight: '68px',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Label variant="body2" sx={columnTXStyles.transactionType}>
            {intl.formatMessage({ id: 'wallet.summary.page.type' })}
          </Label>
          <Label variant="body2" sx={columnTXStyles.status}>
            {intl.formatMessage({ id: 'wallet.summary.page.status' })}
          </Label>
          <Label variant="body2" sx={columnTXStyles.fee}>
            {intl.formatMessage(globalMessages.feeLabel)}
          </Label>
          <Label variant="body2" sx={columnTXStyles.amount}>
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

export const columnTXStyles = {
  transactionType: { flex: '1 1 30%', maxWidth: '30%', textAlign: 'left' },
  status: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'left' },
  fee: { flex: '1 1 16%', maxWidth: '16%', textAlign: 'right' },
  amount: { flex: '1 1 25%', maxWidth: '25%', textAlign: 'right' },
};
