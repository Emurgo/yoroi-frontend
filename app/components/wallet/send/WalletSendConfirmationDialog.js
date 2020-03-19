// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { intlShape } from 'react-intl';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import Dialog from '../../widgets/Dialog';
import DialogCloseButton from '../../widgets/DialogCloseButton';
import globalMessages from '../../../i18n/global-messages';
import LocalizableError from '../../../i18n/LocalizableError';
import styles from './WalletSendConfirmationDialog.scss';
import config from '../../../config';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import RawHash from '../../widgets/hashWrappers/RawHash';
import type { ExplorerType } from '../../../domain/Explorer';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';

import WarningBox from '../../widgets/WarningBox';

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: ExplorerType,
  +amount: string,
  +receivers: Array<string>,
  +totalAmount: string,
  +transactionFee: string,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +amountToNaturalUnits: (amountWithFractions: string) => string,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +currencyUnit: string,
  +classicTheme: boolean,
|};

@observer
export default class WalletSendConfirmationDialog extends Component<Props> {

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
    const walletPasswordField = form.$('walletPassword');
    const {
      onCancel,
      amount,
      receivers,
      totalAmount,
      transactionFee,
      isSubmitting,
      error,
      currencyUnit,
    } = this.props;

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
      isSubmitting ? styles.submitButtonSpinning : null,
    ]);

    const actions = [
      {
        label: intl.formatMessage(globalMessages.backButtonLabel),
        disabled: isSubmitting,
        onClick: onCancel,
      },
      {
        label: intl.formatMessage(globalMessages.sendButtonLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        isSubmitting,
        disabled: !walletPasswordField.isValid,
      },
    ];

    return (
      <Dialog
        title={intl.formatMessage(globalMessages.walletSendConfirmationDialogTitle)}
        actions={actions}
        closeOnOverlayClick={false}
        onClose={!isSubmitting ? onCancel : null}
        className={styles.dialog}
        closeButton={<DialogCloseButton />}
      >
        {this.props.staleTx && staleTxWarning}

        <div className={styles.walletPasswordFields}>
          <div className={styles.addressToLabelWrapper}>
            <div className={styles.addressToLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationAddressToLabel)}
            </div>
            {receivers.map((receiver, i) => (
              <ExplorableHashContainer
                key={receiver + i} // eslint-disable-line react/no-array-index-key
                selectedExplorer={this.props.selectedExplorer}
                hash={addressToDisplayString(receiver)}
                light
                linkType="address"
              >
                <RawHash light>
                  <span className={styles.addressTo}>
                    {addressToDisplayString(receiver)}
                  </span>
                </RawHash>
              </ExplorableHashContainer>
            ))}
          </div>

          <div className={styles.amountFeesWrapper}>
            <div className={styles.amountWrapper}>
              <div className={styles.amountLabel}>
                {intl.formatMessage(globalMessages.amountLabel)}
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
          </div>

          <div className={styles.totalAmountWrapper}>
            <div className={styles.totalAmountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </div>
            <div className={styles.totalAmount}>{totalAmount}
              <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
            </div>
          </div>

          <Input
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={isSubmitting}
            error={walletPasswordField.error}
            skin={InputOwnSkin}
          />
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }
}
