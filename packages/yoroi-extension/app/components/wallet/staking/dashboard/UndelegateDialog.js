// @flow

/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this

import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import TextField from '../../../common/TextField';
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
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../../utils/formatters';

import WarningBox from '../../../widgets/WarningBox';

const messages = defineMessages({
  explanationLine1: {
    id: 'wallet.undelegation.transaction.explanationLine1',
    defaultMessage: '!!!You do NOT need to undelegate before switching stake pools',
  },
  explanationLine2: {
    id: 'wallet.undelegation.transaction.explanationLine2',
    defaultMessage:
      '!!!It will take 2 epochs after the end of the current epoch for undelegation to take effect',
  },
});

type Props = {|
  +staleTx: boolean,
  +transactionFee: MultiToken,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +isSubmitting: boolean,
  +onCancel: void => void,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +classicTheme: boolean,
  +error: ?LocalizableError,
  +generatingTx: boolean,
|};

@observer
export default class UndelegateDialog extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.props.classicTheme
            ? this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder)
            : '',
          value: '',
          validators: [
            ({ field }) => {
              if (field.value === '') {
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              return [true];
            },
          ],
        },
      },
    },
    {
      options: {
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  submit() {
    this.form.submit({
      onSuccess: async form => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        await this.props.onSubmit(transactionData);
      },
      onError: () => {},
    });
  }

  render(): Node {
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
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}
          <br />
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
          : this.props.onCancel,
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

    const rewardAmount = (() => {
      const defaultEntry = this.props.transactionFee.getDefaultEntry();
      const tokenInfo = this.props.getTokenInfo(defaultEntry);

      const formattedAmount = defaultEntry.amount
        .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
        .toFormat(tokenInfo.Metadata.numberOfDecimals);

      return (
        <p className={styles.rewardAmount}>
          {formattedAmount}&nbsp;
          {truncateToken(getTokenName(tokenInfo))}
        </p>
      );
    })();

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
          <li>{intl.formatMessage(messages.explanationLine1)}</li>
          <li>{intl.formatMessage(messages.explanationLine2)}</li>
        </ul>

        <div className={styles.walletPasswordFields}>
          <TextField
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={this.props.isSubmitting}
            error={walletPasswordField.error}
          />
        </div>
        <div className={styles.headerBlock}>
          <p className={styles.header}>
            {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
          </p>
          {rewardAmount}
        </div>
        {this.props.error ? (
          <p className={styles.error}>
            {intl.formatMessage(this.props.error, this.props.error.values)}
          </p>
        ) : null}
      </Dialog>
    );
  }
}
