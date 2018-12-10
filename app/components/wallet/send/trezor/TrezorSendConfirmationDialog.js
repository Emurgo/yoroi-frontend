// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';

import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import ErrorBlock from '../../../widgets/ErrorBlock';

import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';

import styles from './TrezorSendConfirmationDialog.scss';

// TODO: [TREZOR] make globalMessages for common with WalletSendConfirmationDialog
export const messages = defineMessages({
  dialogTitle: {
    id: 'wallet.send.confirmationDialog.title',
    defaultMessage: '!!!Confirm transaction',
    description: 'Title for the "Confirm transaction" dialog.'
  },
  addressToLabel: {
    id: 'wallet.send.confirmationDialog.addressToLabel',
    defaultMessage: '!!!To',
    description: 'Label for the "To" in the wallet send confirmation dialog.',
  },
  amountLabel: {
    id: 'wallet.send.confirmationDialog.amountLabel',
    defaultMessage: '!!!Amount',
    description: 'Label for the "Amount" in the wallet send confirmation dialog.',
  },
  feesLabel: {
    id: 'wallet.send.confirmationDialog.feesLabel',
    defaultMessage: '!!!Fees',
    description: 'Label for the "Fees" in the wallet send confirmation dialog.',
  },
  totalLabel: {
    id: 'wallet.send.confirmationDialog.totalLabel',
    defaultMessage: '!!!Total',
    description: 'Label for the "Total" in the wallet send confirmation dialog.',
  },
  sendUsingTrezorButtonLabel: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
    description: 'Label for the send button in the wallet send confirmation dialog.'
  },
  backButtonLabel: {
    id: 'wallet.send.confirmationDialog.back',
    defaultMessage: '!!!Back',
    description: 'Label for the back button in the wallet send confirmation dialog.'
  },
});

type Props = {
  amount: string,
  receiver: string,
  totalAmount: string,
  transactionFee: string,
  currencyUnit: string,
  amountToNaturalUnits: Function,
  isSubmitting: boolean,
  error: ?LocalizableError,
  onSubmit: Function,
  onCancel: Function,
};

@observer
export default class TrezorSendConfirmationDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      amount,
      receiver,
      totalAmount,
      transactionFee,
      currencyUnit,
      isSubmitting,
      error,
      onCancel,
    } = this.props;

    // TODO: do i18n
    const infoBlock = (
      <div className={styles.infoBlock}>
        <ul>
          <li key="1"><span>After connecting your Trezor device to your computer, press the Send using Trezor button.</span><br /></li>
          <li key="2"><span>A new tab will appear. Please follow the instructions in the new tab.</span><br /></li>
        </ul>
      </div>);

    const addressBlock = (
      <div className={styles.addressToLabelWrapper}>
        <div className={styles.addressToLabel}>
          {intl.formatMessage(messages.addressToLabel)}
        </div>
        <div className={styles.addressTo}>{receiver}</div>
      </div>);

    const amountBlock = (
      <div className={styles.amountFeesWrapper}>
        <div className={styles.amountWrapper}>
          <div className={styles.amountLabel}>{intl.formatMessage(messages.amountLabel)}</div>
          <div className={styles.amount}>{amount}
            <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
          </div>
        </div>

        <div className={styles.feesWrapper}>
          <div className={styles.feesLabel}>{intl.formatMessage(messages.feesLabel)}</div>
          <div className={styles.fees}>+{transactionFee}
            <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
          </div>
        </div>
      </div>);

    const totalAmountBlock = (
      <div className={styles.totalAmountWrapper}>
        <div className={styles.totalAmountLabel}>{intl.formatMessage(messages.totalLabel)}</div>
        <div className={styles.totalAmount}>{totalAmount}
          <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
        </div>
      </div>);

    const confirmButtonClasses = classnames([
      'confirmButton',
      isSubmitting ? styles.submitButtonSpinning : null,
    ]);
    const actions = [
      {
        label: intl.formatMessage(messages.backButtonLabel),
        onClick: !isSubmitting && onCancel,
      },
      {
        label: intl.formatMessage(messages.sendUsingTrezorButtonLabel),
        onClick: this.submit,
        primary: true,
        className: confirmButtonClasses,
        disabled: isSubmitting,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(messages.dialogTitle)}
        actions={actions}
        closeOnOverlayClick
        onClose={!isSubmitting ? onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {infoBlock}
        {addressBlock}
        {amountBlock}
        {totalAmountBlock}
        <ErrorBlock error={error} />
      </Dialog>);
  }

  submit = () => {
    const { receiver, amount, amountToNaturalUnits } = this.props;
    const transactionData = {
      receiver,
      amount: amountToNaturalUnits(amount),
    };
    this.props.onSubmit(transactionData);
  }
}
