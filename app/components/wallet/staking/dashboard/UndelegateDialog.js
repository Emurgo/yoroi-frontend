// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../../themes/skins/InputOwnSkin';
import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../../widgets/Dialog';
import DialogCloseButton from '../../../widgets/DialogCloseButton';
import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './UndelegateDialog.scss';
import AnnotatedLoader from '../../../transfer/AnnotatedLoader';
import config from '../../../../config';

import {
  DECIMAL_PLACES_IN_ADA,
} from '../../../../config/numbersConfig';

import WarningBox from '../../../widgets/WarningBox';

const messages = defineMessages({
  explanationLine1: {
    id: 'wallet.undelegation.transaction.explanationLine1',
    defaultMessage: '!!!You do NOT need to undelegate before switching stake pools',
  },
  explanationLine2: {
    id: 'wallet.undelegation.transaction.explanationLine2',
    defaultMessage: '!!!It will take 2 epochs after the end of the current epoch for undelegation to take effect',
  },
});

type Props = {|
  +staleTx: boolean,
  +transactionFee: BigNumber,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
  +generatingTx: boolean,
|};

@observer
export default class UndelegateDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  form = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
        value: '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit() {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        await this.props.onSubmit(transactionData);
      },
      onError: () => {}
    });
  }

  render() {
    const { form } = this;
    const { intl } = this.context;

    if (this.props.generatingTx) {
      return (
        <Dialog
          title={intl.formatMessage(globalMessages.processingLabel)}
          closeOnOverlayClick={false}
          className={styles.dialog}
        >
          <AnnotatedLoader
            title={intl.formatMessage(globalMessages.processingLabel)}
            details={intl.formatMessage(globalMessages.txGeneration)}
          />
        </Dialog>
      );
    }

    const walletPasswordField = form.$('walletPassword');

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}<br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const confirmButtonClasses = classnames([
      'confirmButton',
      this.props.isSubmitting ? styles.submitButtonSpinning : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        disabled: this.props.isSubmitting,
        onClick: this.props.isSubmitting
          ? () => {} // noop
          : this.props.onCancel
      },
      {
        label: intl.formatMessage(globalMessages.undelegateLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting: this.props.isSubmitting,
        disabled: !walletPasswordField.isValid || this.props.isSubmitting,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!this.props.isSubmitting ? this.props.onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {this.props.staleTx && staleTxWarning}
        <ul className={styles.explanation}>
          <li>
            {intl.formatMessage(messages.explanationLine1)}
          </li>
          <li>
            {intl.formatMessage(messages.explanationLine2)}
          </li>
        </ul>

        <div className={styles.walletPasswordFields}>
          <Input
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={this.props.isSubmitting}
            error={walletPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.header}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </p>
          <p className={styles.rewardAmount}>
            {this.props.transactionFee.toFormat(DECIMAL_PLACES_IN_ADA)}&nbsp;
            {intl.formatMessage(globalMessages.unitAda).toUpperCase()}
          </p>
        </div>
        {this.props.error
          ? <p className={styles.error}>{intl.formatMessage(this.props.error)}</p>
          : null
        }

      </Dialog>
    );
  }
}
