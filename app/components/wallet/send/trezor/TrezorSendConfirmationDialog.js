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

const messages = defineMessages({
  infoLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
    description: 'Informative message line 1 in the wallet trezor send confirmation dialog.'
  },
  infoLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
    description: 'Informative message line 2 in the wallet trezor send confirmation dialog.'
  },
  sendUsingTrezorButtonLabel: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
    description: 'Label for the send button in the wallet send confirmation dialog.'
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

    const infoBlock = (
      <div className={styles.infoBlock}>
        <ul>
          <li key="1"><span>{intl.formatMessage(messages.infoLine1)}</span><br /></li>
          <li key="2"><span>{intl.formatMessage(messages.infoLine2)}</span><br /></li>
        </ul>
      </div>);

    const addressBlock = (
      <div className={styles.addressToLabelWrapper}>
        <div className={styles.addressToLabel}>
          {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
        </div>
        <div className={styles.addressTo}>{receiver}</div>
      </div>);

    const amountBlock = (
      <div className={styles.amountFeesWrapper}>
        <div className={styles.amountWrapper}>
          <div className={styles.amountLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationAmountLabel)}
          </div>
          <div className={styles.amount}>{amount}
            <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
          </div>
        </div>

        <div className={styles.feesWrapper}>
          <div className={styles.feesLabel}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </div>
          <div className={styles.fees}>+{transactionFee}
            <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
          </div>
        </div>
      </div>);

    const totalAmountBlock = (
      <div className={styles.totalAmountWrapper}>
        <div className={styles.totalAmountLabel}>
          {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
        </div>
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
        label: intl.formatMessage(globalMessages.walletSendConfirmationBackButtonLabel),
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
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
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
