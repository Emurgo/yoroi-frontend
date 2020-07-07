// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import classnames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';
import { Input } from 'react-polymorph/lib/components/Input';
import { NumericInput } from 'react-polymorph/lib/components/NumericInput';
import { Checkbox } from 'react-polymorph/lib/components/Checkbox';
import { CheckboxSkin } from 'react-polymorph/lib/skins/simple/CheckboxSkin';
import { defineMessages, intlShape } from 'react-intl';
import { isValidMemoOptional, isValidMemo } from '../../../utils/validations';
import BigNumber from 'bignumber.js';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import AmountInputSkin from '../skins/AmountInputSkin';
import AddMemoSvg from '../../../assets/images/add-memo.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './WalletSendForm.scss';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import type { UriParams } from '../../../utils/URIHandling';
import { getAddressPayload } from '../../../api/ada/lib/storage/bridge/utils';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import type { NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  formattedWalletAmount,
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits
} from '../../../utils/formatters';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import { networks } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  titleLabel: {
    id: 'wallet.send.form.title.label',
    defaultMessage: '!!!Title',
  },
  titleHint: {
    id: 'wallet.send.form.title.hint',
    defaultMessage: '!!!E.g: Money for Frank',
  },
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
  },
  equalsAdaHint: {
    id: 'wallet.send.form.amount.equalsAda',
    defaultMessage: '!!!equals {amount} ADA',
  },
  descriptionLabel: {
    id: 'wallet.send.form.description.label',
    defaultMessage: '!!!Description',
  },
  descriptionHint: {
    id: 'wallet.send.form.description.hint',
    defaultMessage: '!!!You can add a message if you want',
  },
  checkboxLabel: {
    id: 'wallet.send.form.sendAll.checkboxLabel',
    defaultMessage: '!!!Send all {coinName}',
  },
  invalidAddress: {
    id: 'wallet.send.form.errors.invalidAddress',
    defaultMessage: '!!!Please enter a valid address.',
  },
  invalidAmount: {
    id: 'wallet.send.form.errors.invalidAmount',
    defaultMessage: '!!!Please enter a valid amount.',
  },
  invalidTitle: {
    id: 'wallet.send.form.errors.invalidTitle',
    defaultMessage: '!!!Please enter a title with at least 3 characters.',
  },
  transactionFeeError: {
    id: 'wallet.send.form.transactionFeeError',
    defaultMessage: '!!!Not enough Ada for fees. Try sending a smaller amount.',
  },
  calculatingFee: {
    id: 'wallet.send.form.calculatingFee',
    defaultMessage: '!!!Calculating fee...',
  },
  sendingIsDisabled: {
    id: 'wallet.send.form.sendingIsDisabled',
    defaultMessage: '!!!Cannot send a transaction while there is a pending one',
  },
  memoInvalidOptional: {
    id: 'wallet.transaction.memo.optional.invalid',
    defaultMessage: '!!!Memo cannot be more than {maxMemo} characters.',
  },
  cannotSendtoLegacy: {
    id: 'wallet.send.form.cannotSendToLegacy',
    defaultMessage: '!!!You cannot send to legacy addresses (any address created before November 29th, 2019)',
  },
});

type Props = {|
  +currencyUnit: {|
    primaryTicker: string,
  |},
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +currencyMaxIntegerDigits: number,
  +currencyMaxFractionalDigits: number,
  +hasAnyPending: boolean,
  +validateAmount: (amountInNaturalUnits: string) => Promise<boolean>,
  +onSubmit: void => void,
  +isValidJormungandrAddress: string => boolean,
  +isValidLegacyAddress: string => boolean,
  +totalInput: ?BigNumber,
  +classicTheme: boolean,
  +updateReceiver: (void | string) => void,
  +updateAmount: (void | number) => void,
  +updateMemo: (void | string) => void,
  +shouldSendAll: boolean,
  +toggleSendAll: void => void,
  +fee: ?BigNumber,
  +isCalculatingFee: boolean,
  +reset: void => void,
  +error: ?LocalizableError,
  +uriParams: ?UriParams,
  +resetUriParams: void => void,
  +showMemo: boolean,
  +onAddMemo: void => void,
|};

@observer
export default class WalletSendForm extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  amountFieldReactionDisposer: null | (() => mixed) = null;

  componentDidMount(): void {
    this.props.reset();
    if (this.props.uriParams) {
      // assert not null
      const uriParams = this.props.uriParams;
      const adjustedAmount = formattedAmountToNaturalUnits(
        uriParams.amount.toString(),
        this.props.currencyMaxFractionalDigits,
      );
      // note: assume these are validated externally
      this.props.updateAmount(Number(adjustedAmount));
      this.props.updateReceiver(getAddressPayload(uriParams.address));
      this.props.resetUriParams();
    }

    /**
     * Mobx-react-form doesn't allow the value field to be updated based on a computed variable
     * so instead we register a reaction to update it
     */
    this.amountFieldReactionDisposer = reaction(
      () => [this.props.shouldSendAll, this.props.totalInput],
      () => {
        if (!this.props.totalInput || !this.props.fee) {
          return;
        }
        const totalInput = this.props.totalInput;
        const fee = this.props.fee;
        if (!this.props.shouldSendAll) {
          return;
        }
        // once sendAll is triggered, set the amount field to the total input
        this.form.$('amount').set('value', formattedWalletAmount(
          totalInput.minus(fee),
          this.props.currencyMaxFractionalDigits,
        ));
      },
    );
  }

  componentWillUnmount(): void {
    this.props.reset();
    // dispose reaction
    if (this.amountFieldReactionDisposer != null) {
      this.amountFieldReactionDisposer();
    }
  }

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      receiver: {
        label: this.context.intl.formatMessage(messages.receiverLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(messages.receiverHint) : '',
        value: this.props.uriParams
          ? this.props.uriParams.address
          : '',
        validators: [({ field }) => {
          const receiverValue = field.value;
          if (receiverValue === '') {
            this.props.updateReceiver();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const updateReceiver = (isValid) => {
            if (isValid) {
              this.props.updateReceiver(getAddressPayload(receiverValue));
            } else {
              this.props.updateReceiver();
            }
          };
          const isValidLegacy = this.props.isValidLegacyAddress(receiverValue);
          const isJormungandr = (
            this.props.selectedNetwork.NetworkId === networks.JormungandrMainnet.NetworkId
          );
          if (!isJormungandr) {
            updateReceiver(isValidLegacy);
            return [isValidLegacy, this.context.intl.formatMessage(messages.invalidAddress)];
          }
          if (isValidLegacy) {
            return [false, this.context.intl.formatMessage(messages.cannotSendtoLegacy)];
          }
          const isValidJormungandr = this.props.isValidJormungandrAddress(receiverValue);
          updateReceiver(isValidJormungandr);
          return [isValidJormungandr, this.context.intl.formatMessage(messages.invalidAddress)];
        }],
      },
      amount: {
        label: this.context.intl.formatMessage(globalMessages.amountLabel),
        placeholder: this.props.classicTheme ?
          `0.${'0'.repeat(this.props.currencyMaxFractionalDigits)}` : '',
        value: this.props.uriParams
          ? formattedWalletAmount(
            this.props.uriParams.amount,
            this.props.currencyMaxFractionalDigits,
          )
          : '',
        validators: [async ({ field }) => {
          if (this.props.shouldSendAll) {
            // sendall doesn't depend on the amount so always succeed
            return true;
          }
          const amountValue = field.value;
          if (amountValue === '') {
            this.props.updateAmount();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = formattedAmountToNaturalUnits(
            amountValue,
            this.props.currencyMaxFractionalDigits,
          );
          const isValidAmount = await this.props.validateAmount(formattedAmount);
          if (isValidAmount) {
            this.props.updateAmount(Number(formattedAmount));
          } else {
            this.props.updateAmount();
          }
          return [isValidAmount, this.context.intl.formatMessage(messages.invalidAmount)];
        }],
      },
      memo: {
        label: this.context.intl.formatMessage(memoMessages.memoLabel),
        placeholder: this.context.intl.formatMessage(memoMessages.optionalMemo),
        value: '',
        validators: [({ field }) => {
          const memoContent = field.value;
          const isValid = isValidMemoOptional(memoContent);
          if (isValid) {
            this.props.updateMemo(memoContent);
          }
          return [
            isValid,
            this.context.intl.formatMessage(
              messages.memoInvalidOptional,
              { maxMemo: MAX_MEMO_SIZE, }
            )
          ];
        }],
      },
    },
  }, {
    options: {
      // if fields are pre-populated by URI, validate them right away
      showErrorsOnInit: this.props.uriParams,
      validateOnBlur: false,
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const { memo } = this.form.values();
    const {
      currencyUnit,
      currencyMaxIntegerDigits,
      currencyMaxFractionalDigits,
      hasAnyPending,
      classicTheme,
      showMemo,
      onAddMemo
    } = this.props;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const memoField = form.$('memo');
    const amountFieldProps = amountField.bind();

    const transactionFee = this.props.fee || new BigNumber(0);

    const totalAmount = this.props.totalInput
      || formattedAmountToBigNumber(amountFieldProps.value);

    const pendingTxWarningComponent = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(messages.sendingIsDisabled)}
        </WarningBox>
      </div>
    );

    let transactionFeeError = null;
    if (this.props.isCalculatingFee) {
      transactionFeeError = this.context.intl.formatMessage(messages.calculatingFee);
    }
    if (this.props.error) {
      transactionFeeError = this.context.intl.formatMessage(this.props.error);
    }

    return (
      <div className={styles.component}>

        {hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>

          <div className={styles.receiverInput}>
            <Input
              className="receiver"
              {...receiverField.bind()}
              error={receiverField.error}
              skin={InputOwnSkin}
              done={receiverField.isValid}
            />
          </div>

          <div className={styles.amountInput}>
            <NumericInput
              {...amountFieldProps}
              className="amount"
              label={intl.formatMessage(globalMessages.amountLabel)}
              maxBeforeDot={currencyMaxIntegerDigits}
              maxAfterDot={currencyMaxFractionalDigits}
              disabled={this.props.shouldSendAll}
              error={(transactionFeeError || amountField.error)}
              // AmountInputSkin props
              currency={currencyUnit.primaryTicker}
              fees={transactionFee.toFormat(currencyMaxFractionalDigits)}
              total={totalAmount.toFormat(currencyMaxFractionalDigits)}
              skin={AmountInputSkin}
              classicTheme={classicTheme}
            />
          </div>
          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages.checkboxLabel, {
                currency: currencyUnit.primaryTicker
              })}
              onChange={() => {
                this.props.toggleSendAll();
                if (this.props.shouldSendAll) {
                  this.props.updateAmount(Number(formattedAmountToNaturalUnits(
                    this.form.$('amount').value,
                    this.props.currencyMaxFractionalDigits,
                  )));
                }
              }}
              checked={this.props.shouldSendAll}
              skin={CheckboxSkin}
            />
          </div>

          {showMemo ? (
            <div className={styles.memoInput}>
              <Input
                className="memo"
                {...memoField.bind()}
                error={memoField.error}
                skin={InputOwnSkin}
                done={isValidMemo(memo)}
              />
            </div>
          ) : (
            <div className={styles.memoActionItemBlock}>
              <button
                className="addMemoButton"
                type="button"
                onClick={onAddMemo}
              >
                <div>
                  <span className={styles.addMemoIcon}>
                    <AddMemoSvg />
                  </span>
                  <span className={styles.actionLabel}>
                    {intl.formatMessage(memoMessages.addMemo)}
                  </span>
                </div>
              </button>
            </div>
          )}

          {this._makeInvokeConfirmationButton()}

        </BorderedBox>

      </div>
    );
  }

  _makeInvokeConfirmationButton(): Node {
    const { intl } = this.context;
    const { memo } = this.form.values();

    const buttonClasses = classnames([
      'primary',
      styles.nextButton,
    ]);

    const {
      hasAnyPending,
    } = this.props;

    const disabledCondition = (
      !this.props.fee
      || hasAnyPending
      || !isValidMemoOptional(memo)
    );

    return (
      <Button
        className={buttonClasses}
        label={intl.formatMessage(globalMessages.nextButtonLabel)}
        onMouseUp={this.props.onSubmit}
        /** Next Action can't be performed in case transaction fees are not calculated
          * or there's a transaction waiting to be confirmed (pending) */
        disabled={disabledCondition}
        skin={ButtonSkin}
      />);
  }
}
