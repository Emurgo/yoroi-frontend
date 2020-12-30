// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import classnames from 'classnames';

import { defineMessages, intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './VotingRegTxDialog.scss';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import SpendingPasswordInput from '../../widgets/forms/SpendingPasswordInput';
import AmountInputSkin from '../skins/AmountInputSkin';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';

import WarningBox from '../../widgets/WarningBox';

const messages = defineMessages({
  explanationLine1: {
    id: 'wallet.voting.transaction.explanationLine1',
    defaultMessage: '!!!Confirm voting registration',
  },
});

type Props = {|
  +staleTx: boolean,
  +transactionFee: BigNumber,
  +isHardware: boolean,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password?: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
  +meta: {|
    +totalSupply: BigNumber,
    +decimalPlaces: number,
    +ticker: string,
  |},
|};

@observer
export default class VotingRegTxDialog extends Component<Props> {

  @observable spendingPasswordForm: void | ReactToolboxMobxForm;

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };


  @action
  setSpendingPasswordForm(form: ReactToolboxMobxForm) {
    this.spendingPasswordForm = form;
  }

  submit(): void {
    if (this.spendingPasswordForm == null) {
      this.props.onSubmit(Object.freeze({}));
      return;
    }
    this.spendingPasswordForm.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();
        await this.props.onSubmit({ password: walletPassword });
      },
      onError: () => {}
    });
  }

  render(): Node {
    const { intl } = this.context;

    const spendingPasswordForm = this.props.isHardware
      ? undefined
      : (
        <SpendingPasswordInput
          setForm={(form) => this.setSpendingPasswordForm(form)}
          classicTheme={this.props.classicTheme}
          isSubmitting={this.props.isSubmitting}
        />
      );

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
        label: intl.formatMessage(globalMessages.registerLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting: this.props.isSubmitting,
        disabled: this.props.isSubmitting,
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
        </ul>

        <div className={styles.amountInput}>
          <NumericInput
            className="amount"
            label={intl.formatMessage(globalMessages.amountLabel)}
            maxBeforeDot={
              this.props.meta.totalSupply.div(this.props.meta.decimalPlaces).toFixed().length
            }
            maxAfterDot={this.props.meta.decimalPlaces}
            disabled
            // AmountInputSkin props
            currency={this.props.meta.ticker}
            fees={this.props.transactionFee.toFormat(this.props.meta.decimalPlaces)}
            // note: we purposely don't put "total" since it doesn't really make sense here
            // since the fee is unrelated to the amount you're about to stake
            total=""
            value={new BigNumber(0)
              .shiftedBy(-this.props.meta.decimalPlaces)
              .toFormat(this.props.meta.decimalPlaces)
            }
            skin={AmountInputSkin}
            classicTheme={this.props.classicTheme}
          />
        </div>

        <div className={styles.walletPasswordFields}>
          {spendingPasswordForm}
        </div>
        {this.props.error
          ? (
            <p className={styles.error}>
              {intl.formatMessage(this.props.error, this.props.error.values)}
            </p>
          )
          : null
        }

      </Dialog>
    );
  }
}
