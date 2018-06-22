// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Button from 'react-polymorph/lib/components/Button';
import SimpleButtonSkin from 'react-polymorph/lib/skins/simple/raw/ButtonSkin';
import { defineMessages, intlShape } from 'react-intl';
import BorderedBox from '../widgets/BorderedBox';
import styles from './DaedalusTransferSummaryPage.scss';
import type { TransferTx } from '../../stores/ada/DaedalusTransferStore';

// FIXME: Add translations in i18n files
const messages = defineMessages({
  title: {
    id: 'daedalusTransfer.summary.title.label',
    defaultMessage: '!!!Transfer funds from Daedalus wallet',
    description: 'Label "Transfer funds from Daedalus wallet" on the Daedalus transfer summary page.'
  },
  addressFromLabel: {
    id: 'daedalusTransfer.summary.addressFrom.label',
    defaultMessage: 'From'
  },
  addressFromSubLabel: {
    id: 'daedalusTransfer.summary.addressFrom.subLabel',
    defaultMessage: 'Daedalus wallet Addresses'
  },
  addressToLabel: {
    id: 'daedalusTransfer.summary.addressTo.label',
    defaultMessage: 'To'
  },
  recoveredBalanceLabel: {
    id: 'daedalusTransfer.summary.recoveredBalance.label',
    defaultMessage: 'Recovered balance'
  },
  transactionFeeLabel: {
    id: 'daedalusTransfer.summary.transactionFee.label',
    defaultMessage: 'Transaction fees'
  },
  finalBalanceLabel: {
    id: 'daedalusTransfer.summary.finalBalance.label',
    defaultMessage: 'Final balance'
  },
  transferButtonLabel: {
    id: 'daedalusTransfer.summary.transferButton.label',
    defaultMessage: 'Transfer Funds'
  }
});

// FIXME: Handle submiting and error transitions
type Props = {
  formattedWalletAmount: Function,
  transferTx: TransferTx,
  onSubmit: Function
};

@observer
export default class DaedalusTransferSummaryPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { transferTx } = this.props;

    const receiver = transferTx.receiver;
    // FIXME: formattedWalletAmount is not accurate for this amounts!
    const recoveredBalance = this.props.formattedWalletAmount(transferTx.recoveredBalance);
    const transactionFee = this.props.formattedWalletAmount(transferTx.fee);
    const finalBalance = this.props.formattedWalletAmount(
      transferTx.recoveredBalance.minus(transferTx.fee)
    );

    const buttonClasses = classnames([
      'primary',
      styles.transferButton,
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
                {intl.formatMessage(messages.addressFromSubLabel)}
              </div>
              {
                transferTx.senders.map((sender, index) => (
                  <div key={index} className={styles.address}>{sender}</div>
                ))
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

            <Button
              className={buttonClasses}
              label={intl.formatMessage(messages.transferButtonLabel)}
              onClick={this.props.onSubmit}
              skin={<SimpleButtonSkin />}
            />

          </div>

        </BorderedBox>

      </div>
    );
  }
}
