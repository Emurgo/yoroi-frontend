// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import styles from './TransferSummaryPage.scss';
import type { TransferTx } from '../../types/TransferTypes';
import LocalizableError from '../../i18n/LocalizableError';

const messages = defineMessages({
  addressFromLabel: {
    id: 'transfer.summary.addressFrom.label',
    defaultMessage: '!!!From',
  },
  addressToLabel: {
    id: 'transfer.summary.addressTo.label',
    defaultMessage: '!!!To',
  },
  recoveredBalanceLabel: {
    id: 'transfer.summary.recoveredBalance.label',
    defaultMessage: '!!!Recovered balance',
  },
  transactionFeeLabel: {
    id: 'transfer.summary.transactionFee.label',
    defaultMessage: '!!!Transaction fees',
  },
  finalBalanceLabel: {
    id: 'transfer.summary.finalBalance.label',
    defaultMessage: '!!!Final balance',
  },
  cancelTransferButtonLabel: {
    id: 'transfer.summary.cancelTransferButton.label',
    defaultMessage: '!!!Cancel',
  },
  transferButtonLabel: {
    id: 'transfer.summary.transferButton.label',
    defaultMessage: '!!!Transfer Funds',
  }
});

type Props = {
  formattedWalletAmount: Function,
  transferTx: TransferTx,
  onSubmit: Function,
  isSubmitting: boolean,
  onCancel: Function,
  error: ?LocalizableError,
  addressFromSubLabel: string,
  classicTheme: boolean
};

/** Show user what the transfer would do to get final confirmation */
@observer
export default class TransferSummaryPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { transferTx, isSubmitting, error, addressFromSubLabel, classicTheme } = this.props;

    const receiver = transferTx.receiver;
    const recoveredBalance = this.props.formattedWalletAmount(transferTx.recoveredBalance);
    const transactionFee = this.props.formattedWalletAmount(transferTx.fee);
    const finalBalance = this.props.formattedWalletAmount(
      transferTx.recoveredBalance.minus(transferTx.fee)
    );

    const nextButtonClasses = classnames([
      'transferButton',
      isSubmitting ? styles.isSubmitting : 'primary',
      styles.button,
    ]);

    const cancelButtonClasses = classnames([
      'cancelTransferButton',
      classicTheme ? 'flat' : 'outlined',
      styles.button,
    ]);

    return (
      <div className={styles.component}>
        <BorderedBox>

          <div className={styles.body}>

            <div className={styles.addressLabelWrapper}>
              <div className={styles.addressLabel}>
                {intl.formatMessage(messages.addressFromLabel)}
              </div>
              <div className={styles.addressSubLabel}>
                {addressFromSubLabel}
              </div>
              {
                transferTx.senders.map((sender, index) => {
                  const addressesClasses = classnames([
                    'addressRecovered-' + (index + 1),
                    styles.address
                  ]);

                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className={addressesClasses}>{sender}</div>
                  );
                })
              }
            </div>

            <div className={styles.addressLabelWrapper}>
              <div className={styles.addressLabel}>
                {intl.formatMessage(messages.addressToLabel)}
              </div>
              <div className={styles.address}>{receiver}</div>
            </div>

            <div className={styles.amountFeesWrapper}>
              <div className={styles.amountWrapper}>
                <div className={styles.amountLabel}>
                  {intl.formatMessage(messages.recoveredBalanceLabel)}
                </div>
                <div className={styles.amount}>{recoveredBalance}
                  <span className={styles.currencySymbol}>&nbsp;ADA</span>
                </div>
              </div>

              <div className={styles.feesWrapper}>
                <div className={styles.feesLabel}>
                  {intl.formatMessage(messages.transactionFeeLabel)}
                </div>
                <div className={styles.fees}>+{transactionFee}
                  <span className={styles.currencySymbol}>&nbsp;ADA</span>
                </div>
              </div>
            </div>

            <div className={styles.totalAmountWrapper}>
              <div className={styles.totalAmountLabel}>
                {intl.formatMessage(messages.finalBalanceLabel)}
              </div>
              <div className={styles.totalAmount}>{finalBalance}
                <span className={styles.currencySymbol}>&nbsp;ADA</span>
              </div>
            </div>

            <div className={styles.errorWrapper}>
              {
                error && !isSubmitting &&
                  <p className={styles.error}>{intl.formatMessage(error)}</p>
              }
            </div>

            <div className={styles.buttonsWrapper}>
              <Button
                className={cancelButtonClasses}
                label={intl.formatMessage(messages.cancelTransferButtonLabel)}
                onClick={this.props.onCancel}
                disabled={isSubmitting}
                skin={ButtonSkin}
              />

              <Button
                className={nextButtonClasses}
                label={intl.formatMessage(messages.transferButtonLabel)}
                onClick={this.props.onSubmit}
                disabled={isSubmitting}
                skin={ButtonSkin}
              />
            </div>

          </div>

        </BorderedBox>

      </div>
    );
  }
}
