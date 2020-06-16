// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Input } from 'react-polymorph/lib/components/Input';
import BigNumber from 'bignumber.js';
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
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: ExplorerType,
  +amount: BigNumber,
  +receivers: Array<string>,
  +totalAmount: BigNumber,
  +transactionFee: BigNumber,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +amountToNaturalUnits: (amountWithFractions: string) => string,
  +formattedWalletAmount: BigNumber => string,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +currencyUnit: string,
  +classicTheme: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +coinPrice: ?number
|};

@observer
export default class WalletSendConfirmationDialog extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
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

  submit(): void {
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

  render(): Node {
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
              {unitOfAccountSetting.enabled ? (
                <>
                  <div className={styles.amount}>
                    {coinPrice != null ?
                      calculateAndFormatValue(amount, coinPrice) :
                      '-'
                    }
                    <span className={styles.currencySymbol}>
                      &nbsp;{unitOfAccountSetting.currency}
                    </span>
                  </div>
                  <div className={styles.amountSmall}>{this.props.formattedWalletAmount(amount)}
                    <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                  </div>
                </>
              ) : (
                <div className={styles.amount}>{this.props.formattedWalletAmount(amount)}
                  <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                </div>
              )}
            </div>

            <div className={styles.feesWrapper}>
              <div className={styles.feesLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationFeesLabel)}
              </div>
              {unitOfAccountSetting.enabled ? (
                <>
                  <div className={styles.fees}>+
                    {coinPrice != null ?
                      calculateAndFormatValue(transactionFee, coinPrice) :
                      '-'
                    }
                    <span className={styles.currencySymbol}>
                      &nbsp;{unitOfAccountSetting.currency}
                    </span>
                  </div>
                  <div className={styles.feesSmall}>
                    +{this.props.formattedWalletAmount(transactionFee)}
                    <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                  </div>
                </>
              ) : (
                <div className={styles.fees}>
                  +{this.props.formattedWalletAmount(transactionFee)}
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
              <>
                <div className={styles.totalAmount}>
                  {coinPrice != null ?
                    calculateAndFormatValue(totalAmount, coinPrice) :
                    '-'
                  }
                  <span className={styles.currencySymbol}>
                    &nbsp;{unitOfAccountSetting.currency}
                  </span>
                </div>
                <div className={styles.totalAmountSmall}>
                  {this.props.formattedWalletAmount(totalAmount)}
                  <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
                </div>
              </>
            ) : (
              <div className={styles.totalAmount}>{this.props.formattedWalletAmount(totalAmount)}
                <span className={styles.currencySymbol}>&nbsp;{currencyUnit}</span>
              </div>
            )}
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
