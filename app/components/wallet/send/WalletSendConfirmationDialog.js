// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import BigNumber from 'bignumber.js';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { defineMessages, intlShape } from 'react-intl';
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

import WarningBox from '../../widgets/WarningBox';
import type { BaseSignRequest } from '../../../api/ada/adaTypes';
import { formattedWalletAmount } from '../../../utils/formatters';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';

const messages = defineMessages({
  walletPasswordLabel: {
    id: 'wallet.send.confirmationDialog.walletPasswordLabel',
    defaultMessage: '!!!Spending password',
  },
  walletPasswordFieldPlaceholder: {
    id: 'wallet.send.confirmationDialog.walletPasswordFieldPlaceholder',
    defaultMessage: '!!!Type your spending password',
  },
  sendButtonLabel: {
    id: 'wallet.send.confirmationDialog.submit',
    defaultMessage: '!!!Send',
  },
});

type Props = {|
  staleTx: boolean,
  selectedExplorer: ExplorerType,
  amount: BigNumber,
  receivers: Array<string>,
  totalAmount: BigNumber,
  transactionFee: BigNumber,
  onSubmit: ({ password: string }) => void,
  amountToNaturalUnits: (amountWithFractions: string) => string,
  signRequest: BaseSignRequest,
  onCancel: Function,
  isSubmitting: boolean,
  error: ?LocalizableError,
  currencyUnit: string,
  classicTheme: boolean,
  unitOfAccountSetting: UnitOfAccountSettingType,
  coinPrice: ?number
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
        label: this.context.intl.formatMessage(messages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.walletPasswordFieldPlaceholder) : '',
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
      onSuccess: (form) => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        this.props.onSubmit(transactionData);
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
      classicTheme,
      unitOfAccountSetting,
      coinPrice,
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
        onClick: isSubmitting
          ? () => {} // noop
          : onCancel
      },
      {
        label: intl.formatMessage(messages.sendButtonLabel),
        onClick: this.submit.bind(this),
        primary: true,
        className: confirmButtonClasses,
        disabled: !walletPasswordField.isValid || isSubmitting,
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
        classicTheme={classicTheme}
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
                hash={receiver}
                light
                linkType="address"
              >
                <RawHash light>
                  <span className={styles.addressTo}>
                    {receiver}
                  </span>
                </RawHash>
              </ExplorableHashContainer>
            ))}
          </div>

          <div className={styles.amountFeesWrapper}>
            <div className={styles.amountWrapper}>
              <div className={styles.amountLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationAmountLabel)}
              </div>
              {unitOfAccountSetting.enabled ? (
                <Fragment>
                  <div className={styles.amount}>
                    {coinPrice ?
                      formattedWalletAmount(amount.multipliedBy(coinPrice)) :
                      '-'
                    }
                    <span className={styles.currencySymbol}>
                      &nbsp;{unitOfAccountSetting.currency}
                    </span>
                  </div>
                  <div className={styles.amountSmall}>{formattedWalletAmount(amount)}
                    <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                  </div>
                </Fragment>
              ) : (
                <div className={styles.amount}>{formattedWalletAmount(amount)}
                  <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                </div>
              )}
            </div>

            <div className={styles.feesWrapper}>
              <div className={styles.feesLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
              </div>
              {unitOfAccountSetting.enabled ? (
                <Fragment>
                  <div className={styles.fees}>+
                    {coinPrice ?
                      formattedWalletAmount(transactionFee.multipliedBy(coinPrice)) :
                      '-'
                    }
                    <span className={styles.currencySymbol}>
                      &nbsp;{unitOfAccountSetting.currency}
                    </span>
                  </div>
                  <div className={styles.feesSmall}>+{formattedWalletAmount(transactionFee)}
                    <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                  </div>
                </Fragment>
              ) : (
                <div className={styles.fees}>
                  +{formattedWalletAmount(transactionFee)}
                  <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.totalAmountWrapper}>
            <div className={styles.totalAmountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </div>
            {unitOfAccountSetting.enabled ? (
              <Fragment>
                <div className={styles.totalAmount}>
                  {coinPrice ?
                    formattedWalletAmount(totalAmount.multipliedBy(coinPrice)) :
                    '-'
                  }
                  <span className={styles.currencySymbol}>
                    &nbsp;{unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.totalAmountSmall}>
                  {formattedWalletAmount(totalAmount)}
                  <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                </div>
              </Fragment>
            ) : (
              <div className={styles.totalAmount}>{formattedWalletAmount(totalAmount)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            )}
          </div>

          {
            <Input
              type="password"
              className={styles.walletPassword}
              {...walletPasswordField.bind()}
              disabled={isSubmitting}
              error={walletPasswordField.error}
              skin={InputOwnSkin}
            />
          }
        </div>

        {error ? <p className={styles.error}>{intl.formatMessage(error)}</p> : null}

      </Dialog>
    );
  }
}
