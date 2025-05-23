// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, IntlContext } from 'react-intl';
import styles from './TransferSummaryPage.scss';
import LocalizableError from '../../i18n/LocalizableError';
import RawHash from '../widgets/hashWrappers/RawHash';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import globalMessages from '../../i18n/global-messages';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import { truncateAddress, truncateToken } from '../../utils/formatters';
import type { TransferTx } from '../../types/TransferTypes';
import { genAddressLookup } from '../../stores/stateless/addressStores';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount } from '../../stores/stateless/tokenHelpers';
import { Box, Typography, styled } from '@mui/material';

const messages = defineMessages({
  addressFromLabel: {
    id: 'transfer.summary.addressFrom.label',
    defaultMessage: '!!!From',
  },
  recoveredBalanceLabel: {
    id: 'transfer.summary.recoveredBalance.label',
    defaultMessage: '!!!Recovered balance',
  },
  transactionFeeLabel: {
    id: 'transfer.summary.transactionFee.label',
    defaultMessage: '!!!Transaction fees',
  },
  transferButtonLabel: {
    id: 'transfer.summary.transferButton.label',
    defaultMessage: '!!!Transfer Funds',
  },
  unregisterExplanation: {
    id: 'wallet.withdrawal.transaction.unregister',
    defaultMessage: '!!!This transaction will unregister one or more staking keys, giving you back your {refundAmount} {ticker} from your deposit',
  },
});

const STypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.ds.text_gray_medium,
  fontWeight: 500,
}));

type Props = {|
  +dialogTitle: string,
  +selectedExplorer: SelectedExplorer,
  +transferTx: TransferTx,
  +onSubmit: {|
    +trigger: void => PossiblyAsync<void>,
    +label: string,
  |},
  +isSubmitting: boolean,
  +onCancel: {|
    +trigger: void => void,
    +label: string,
  |},
  +error: ?LocalizableError,
  +form: ?Node,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +addressToDisplayString: string => string,
  +addressLookup: ReturnType<typeof genAddressLookup>,
  +header?: Node,
|};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class TransferSummaryPage extends Component<Props> {

  static contextType:any = IntlContext;
  static defaultProps: {|header: void|} = {
    header: undefined
  };

  wrapInDialog: Node => Node = (content) => {
    const actions = [
      {
        label: this.props.onCancel.label,
        onClick: this.props.onCancel.trigger,
        className: classnames(['cancelTransferButton']),
        disabled: this.props.isSubmitting,
      },
      {
        label: this.props.onSubmit.label,
        onClick: this.props.onSubmit.trigger,
        primary: true,
        className: classnames(['transferButton']),
        isSubmitting: this.props.isSubmitting,
      },
    ];
    return (
      <Dialog
        styleOverride={{ '--yoroi-comp-dialog-min-width-md': '680px' }}
        title={this.props.dialogTitle}
        dialogActions={actions}
        closeButton={<DialogCloseButton />}
        onClose={this.props.onCancel.trigger}
        closeOnOverlayClick={false}
      >
        {content}
      </Dialog>
    );
  }

  getHeader: void => Node = () => {
    const intl = this.context;
    const { transferTx, } = this.props;
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    if (transferTx.withdrawals != null || transferTx.deregistrations != null) {
      const { withdrawals, deregistrations } = transferTx;
      return (
        <>
          {withdrawals != null && withdrawals.length > 0 && (
            <div className={styles.addressLabelWrapper}>
              <div className={styles.addressLabel}>
                {intl.formatMessage(globalMessages.withdrawalsLabel)}
              </div>
              {withdrawals.map((withdrawal, index) => {
                const addressesClasses = classnames([
                  'withdrawal-' + (index + 1),
                  styles.address
                ]);

                return (
                  <div
                    key={index /* eslint-disable-line react/no-array-index-key */}
                  >
                    <div className={styles.addressSubLabel} />
                    <ExplorableHashContainer
                      selectedExplorer={this.props.selectedExplorer}
                      light
                      hash={this.props.addressToDisplayString(withdrawal.address)}
                      linkType="address"
                    >
                      <RawHash light>
                        <span className={addressesClasses}>
                          {truncateAddress(this.props.addressToDisplayString(withdrawal.address))}
                        </span>
                      </RawHash>
                    </ExplorableHashContainer>
                  </div>
                );
              })}
            </div>
          )}
          {deregistrations != null && deregistrations.length > 0 && (
            <div className={styles.addressLabelWrapper}>
              <div className={styles.addressLabel}>
                {intl.formatMessage(globalMessages.StakeDeregistration)}
              </div>
              {deregistrations.map((deregistration, index) => {
                const addressesClasses = classnames([
                  'deregistration-' + (index + 1),
                  styles.address
                ]);

                return (
                  <div
                    key={index /* eslint-disable-line react/no-array-index-key */}
                  >
                    <div className={styles.addressSubLabel} />
                    <ExplorableHashContainer
                      selectedExplorer={this.props.selectedExplorer}
                      light
                      hash={this.props.addressToDisplayString(deregistration.rewardAddress)}
                      linkType="stakeAddress"
                    >
                      <RawHash light>
                        <span className={addressesClasses}>
                          {truncateAddress(
                            this.props.addressToDisplayString(deregistration.rewardAddress)
                          )}
                        </span>
                      </RawHash>
                    </ExplorableHashContainer>
                    {}
                  </div>
                );
              })}
              <div className={styles.refund}>
                {intl.formatMessage(messages.unregisterExplanation, {
                  ticker: truncateToken(getTokenName(this.props.getTokenInfo(
                    this.props.transferTx.recoveredBalance.getDefaultEntry()
                  ))),
                  refundAmount: formatValue(deregistrations.reduce(
                    (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
                    new MultiToken([], this.props.transferTx.recoveredBalance.defaults)
                  ).getDefaultEntry())
                })}
              </div>
            </div>
          )}
        </>
      );
    }
    return (
      <>
        <div className={styles.addressLabelWrapper}>
          <STypography variant="body2">
            {intl.formatMessage(messages.addressFromLabel)}
          </STypography>
          {
            transferTx.senders.map((sender, index) => {
              const addressesClasses = classnames([
                'addressRecovered-' + (index + 1),
                styles.address
              ]);

              return (
                <div
                  key={index /* eslint-disable-line react/no-array-index-key */}
                >
                  <div className={styles.addressSubLabel} />
                  <ExplorableHashContainer
                    selectedExplorer={this.props.selectedExplorer}
                    light
                    hash={this.props.addressToDisplayString(sender)}
                    linkType="address"
                  >
                    <RawHash light>
                      <span className={addressesClasses}>
                        {truncateAddress(this.props.addressToDisplayString(sender))}
                      </span>
                    </RawHash>
                  </ExplorableHashContainer>
                </div>
              );
            })
          }
        </div>
        <div className={styles.addressLabelWrapper}>
          <STypography variant="body2">
            {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
          </STypography>
          {
            transferTx.receivers.map((receiver, index) => {
              const addressesClasses = classnames([
                'to-' + (index + 1),
                styles.address
              ]);
              return (
                <div
                  key={index /* eslint-disable-line react/no-array-index-key */}
                >
                  <ExplorableHashContainer
                    selectedExplorer={this.props.selectedExplorer}
                    light
                    hash={this.props.addressToDisplayString(receiver)}
                    linkType="address"
                  >
                    <RawHash light>
                      <span className={addressesClasses}>
                        {truncateAddress(this.props.addressToDisplayString(receiver))}
                      </span>
                    </RawHash>
                  </ExplorableHashContainer>
                </div>
              );
            })
          }
        </div>
      </>
    );
  }

  getTotalBalance: void => MultiToken = () => {
    const baseTotal = this.props.transferTx.recoveredBalance.joinSubtractCopy(
      this.props.transferTx.fee
    );
    if (this.props.transferTx.deregistrations == null) {
      return baseTotal;
    }
    const refundSum = this.props.transferTx.deregistrations.reduce(
      (sum, curr) => (curr.refund == null ? sum : sum.joinAddCopy(curr.refund)),
      new MultiToken([], this.props.transferTx.recoveredBalance.defaults)
    );
    return baseTotal.joinAddCopy(refundSum);
  }

  render(): Node {
    const intl = this.context;
    const { transferTx, isSubmitting, error, unitOfAccountSetting, } = this.props;

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    const convertedToUnitOfAccount = (tokens, toCurrency) => {
      const defaultEntry = tokens.getDefaultEntry();
      const tokenInfo = this.props.getTokenInfo(defaultEntry);

      const shiftedAmount = defaultEntry.amount
        .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

      const coinPrice = this.props.getCurrentPrice(
        getTokenName(tokenInfo),
        toCurrency
      );

      if (coinPrice == null) return '-';

      return calculateAndFormatValue(
        shiftedAmount,
        coinPrice
      );
    };

    const recoveredBalance = formatValue(
      transferTx.recoveredBalance.getDefaultEntry()
    );
    const transactionFee = formatValue(
      transferTx.fee.getDefaultEntry()
    );
    const finalBalance = formatValue(
      this.getTotalBalance().getDefaultEntry()
    );
    const cryptoSymbol = (
      <span className={styles.currencySymbol}>
        &nbsp;
        {truncateToken(getTokenName(this.props.getTokenInfo(
          transferTx.recoveredBalance.getDefaultEntry()
        )))}
      </span>
    );

    return this.wrapInDialog(
      <div className={styles.body}>
        {this.props.header}
        {this.getHeader()}
        {transferTx.id != null && (this._getTxIdNode(transferTx.id))}

        <div className={styles.amountFeesWrapper}>
          <div className={styles.amountWrapper}>
            <STypography variant="body2">
              {intl.formatMessage(messages.recoveredBalanceLabel)}
            </STypography>
            {unitOfAccountSetting.enabled /* tmp */ && false ? (
              <>
                <div className={styles.amount}>
                  {convertedToUnitOfAccount(
                    transferTx.recoveredBalance,
                    unitOfAccountSetting.currency
                  )}
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.amountSmall}>
                  {recoveredBalance}
                  {cryptoSymbol}
                </div>
              </>
            ) : (
              <div className={styles.amount}>
                {recoveredBalance}
                {cryptoSymbol}
              </div>
            )}
          </div>

          <div className={styles.feesWrapper}>
            <STypography variant="body2">
              {intl.formatMessage(messages.transactionFeeLabel)}
            </STypography>
            {unitOfAccountSetting.enabled /* tmp */ && false ? (
              <>
                <div className={styles.fees}>
                  {convertedToUnitOfAccount(
                    transferTx.fee,
                    unitOfAccountSetting.currency
                  )}
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.feesSmall}>
                  {transactionFee}
                  {cryptoSymbol}
                </div>
              </>
            ) : (
              <div className={styles.fees}>
                {transactionFee}
                {cryptoSymbol}
              </div>
            )}
          </div>
        </div>

        <div className={styles.totalAmountWrapper}>
          <STypography variant="body2">
            {intl.formatMessage(globalMessages.finalBalanceLabel)}
          </STypography>
          {unitOfAccountSetting.enabled /* tmp */ && false ? (
            <>
              <div className={styles.totalAmount}>
                {convertedToUnitOfAccount(
                    transferTx.recoveredBalance
                      .joinSubtractCopy(transferTx.fee),
                    unitOfAccountSetting.currency
                  )}
                <span className={styles.currencySymbol}>&nbsp;
                  {unitOfAccountSetting.currency}
                </span>
              </div>
              <div className={styles.totalAmountSmall}>
                {finalBalance}
                {cryptoSymbol}
              </div>
            </>
          ) : (
            <div className={styles.totalAmount}>
              {finalBalance}
              {cryptoSymbol}
            </div>
          )}
        </div>

        {this.props.form != null && (
          <div className={styles.form}>
            {this.props.form}
          </div>
        )}

        <div className={styles.errorWrapper}>
          {
            error && !isSubmitting && (
              <div className={styles.error}>
                {intl.formatMessage(error, error.values)}
              </div>
            )
          }
        </div>
      </div>
    );
  }

  _getTxIdNode: string => Node = (txId) => {
    const intl = this.context;
    return (
      <Box mb="20px">
        <STypography variant="body2">
          {intl.formatMessage(globalMessages.transactionId)}
        </STypography>
        <ExplorableHashContainer
          selectedExplorer={this.props.selectedExplorer}
          light
          hash={txId}
          linkType="transaction"
        >
          <RawHash light>
            <span className={styles.address}>{txId}</span>
          </RawHash>
        </ExplorableHashContainer>
      </Box>
    );
  }
}
