// @flow
import React, { Component, } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import styles from './TransferSummaryPage.scss';
import LocalizableError from '../../i18n/LocalizableError';
import RawHash from '../widgets/hashWrappers/RawHash';
import DialogCloseButton from '../widgets/DialogCloseButton';
import Dialog from '../widgets/Dialog';
import ExplorableHashContainer from '../../containers/widgets/ExplorableHashContainer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import { truncateAddress } from '../../utils/formatters';
import type { TransferTx } from '../../types/TransferTypes';
import { genAddressLookup } from '../../stores/stateless/addressStores';

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
    defaultMessage: '!!!This transaction will unregister one or more staking keys, giving you back your {refundAmount} ADA from your deposit',
  },
});

type Props = {|
  +dialogTitle: string,
  +formattedWalletAmount: BigNumber => string,
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
  +coinPrice: ?number,
  +addressToDisplayString: string => string,
  +addressLookup: ReturnType<typeof genAddressLookup>,
  +header?: Node,
|};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class TransferSummaryPage extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

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
        styleOverride={{ '--theme-modal-min-max-width-cmn': '680px' }}
        title={this.props.dialogTitle}
        actions={actions}
        closeButton={<DialogCloseButton />}
        onClose={this.props.onCancel.trigger}
        closeOnOverlayClick={false}
      >
        {content}
      </Dialog>
    );
  }

  getHeader: void => Node = () => {
    const { intl } = this.context;
    const { transferTx, } = this.props;

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
                      linkType="address"
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
                  refundAmount: deregistrations.reduce(
                    (sum, curr) => (curr.refund == null ? sum : sum.plus(curr.refund)),
                    new BigNumber(0)
                  ).toString()
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
          <div className={styles.addressLabel}>
            {intl.formatMessage(messages.addressFromLabel)}
          </div>
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
          <div className={styles.addressLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
          </div>
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

  getTotalBalance: void => BigNumber = () => {
    const baseTotal = this.props.transferTx.recoveredBalance.minus(this.props.transferTx.fee);
    if (this.props.transferTx.deregistrations == null) {
      return baseTotal;
    }
    const refundSum = this.props.transferTx.deregistrations.reduce(
      (sum, curr) => (curr.refund == null ? sum : sum.plus(curr.refund)),
      new BigNumber(0)
    );
    return baseTotal.plus(refundSum);
  }

  render(): Node {
    const { intl } = this.context;
    const { transferTx, isSubmitting, error, unitOfAccountSetting, coinPrice, } = this.props;

    const recoveredBalance = this.props.formattedWalletAmount(transferTx.recoveredBalance);
    const transactionFee = this.props.formattedWalletAmount(transferTx.fee);
    const finalBalance = this.props.formattedWalletAmount(this.getTotalBalance());

    return this.wrapInDialog(
      <div className={styles.body}>
        {this.props.header}
        {this.getHeader()}
        {transferTx.id != null && (this._getTxIdNode(transferTx.id))}

        <div className={styles.amountFeesWrapper}>
          <div className={styles.amountWrapper}>
            <div className={styles.amountLabel}>
              {intl.formatMessage(messages.recoveredBalanceLabel)}
            </div>
            {unitOfAccountSetting.enabled ? (
              <>
                <div className={styles.amount}>
                  {coinPrice != null
                    ? calculateAndFormatValue(transferTx.recoveredBalance, coinPrice)
                    : '-'
                  }
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.amountSmall}>{recoveredBalance}
                  <span className={styles.currencySymbol}>
                    &nbsp;{unitOfAccountSetting.currency}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.amount}>{recoveredBalance}
                <span className={styles.currencySymbol}>
                  &nbsp;ADA
                </span>
              </div>
            )}
          </div>

          <div className={styles.feesWrapper}>
            <div className={styles.feesLabel}>
              {intl.formatMessage(messages.transactionFeeLabel)}
            </div>
            {unitOfAccountSetting.enabled ? (
              <>
                <div className={styles.fees}>
                  {'+' + (coinPrice != null
                    ? calculateAndFormatValue(transferTx.fee, coinPrice)
                    : '-'
                  )}
                  <span className={styles.currencySymbol}>&nbsp;
                    {unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.feesSmall}>{transactionFee}
                  <span className={styles.currencySymbol}>
                    &nbsp;{unitOfAccountSetting.currency}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.fees}>{transactionFee}
                <span className={styles.currencySymbol}>
                  &nbsp;ADA
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.totalAmountWrapper}>
          <div className={styles.totalAmountLabel}>
            {intl.formatMessage(globalMessages.finalBalanceLabel)}
          </div>
          {unitOfAccountSetting.enabled ? (
            <>
              <div className={styles.totalAmount}>
                {coinPrice != null
                  ? calculateAndFormatValue(
                    transferTx.recoveredBalance.minus(transferTx.fee),
                    coinPrice
                  )
                  : '-'
                }
                <span className={styles.currencySymbol}>&nbsp;
                  {unitOfAccountSetting.currency}
                </span>
              </div>
              <div className={styles.totalAmountSmall}>{finalBalance}
                <span className={styles.currencySymbol}>
                  &nbsp;{unitOfAccountSetting.currency}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.totalAmount}>{finalBalance}
              <span className={styles.currencySymbol}>
                &nbsp;ADA
              </span>
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
              <p className={styles.error}>
                {intl.formatMessage(error, error.values)}
              </p>
            )
          }
        </div>
      </div>
    );
  }

  _getTxIdNode: string => Node = (txId) => {
    const { intl } = this.context;
    return (
      <div className={styles.addressLabelWrapper}>
        <div className={styles.addressLabel}>
          {intl.formatMessage(globalMessages.transactionId)}
        </div>
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
      </div>
    );
  }
}
