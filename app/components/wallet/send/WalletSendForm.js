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
import { isValidMemoOptional, isValidMemo, } from '../../../utils/validations';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import AmountInputSkin from '../skins/AmountInputSkin';
import AddMemoSvg from '../../../assets/images/add-memo.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './WalletSendForm.scss';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import type { UriParams } from '../../../utils/URIHandling';
import { getAddressPayload, isValidReceiveAddress } from '../../../api/ada/lib/storage/bridge/utils';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits
} from '../../../utils/formatters';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { getTokenName, genFormatTokenAmount, } from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';

const messages = defineMessages({
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
  },
  checkboxLabel: {
    id: 'wallet.send.form.sendAll.checkboxLabel',
    defaultMessage: '!!!Send all {coinName}',
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
});

type Props = {|
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +hasAnyPending: boolean,
  +validateAmount: (
    amountInNaturalUnits: string,
    tokenRow: $ReadOnly<TokenRow>,
  ) => Promise<[boolean, void | string]>,
  +onSubmit: void => void,
  +totalInput: ?MultiToken,
  +classicTheme: boolean,
  +updateReceiver: (void | string) => void,
  +updateAmount: (void | number) => void,
  +updateMemo: (void | string) => void,
  +shouldSendAll: boolean,
  +toggleSendAll: void => void,
  +fee: ?MultiToken,
  +isCalculatingFee: boolean,
  +reset: void => void,
  +error: ?LocalizableError,
  +uriParams: ?UriParams,
  +resetUriParams: void => void,
  +showMemo: boolean,
  +onAddMemo: void => void,
  +getTokenInfo: Inexact<TokenLookupKey> => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>, // need since no guarantee input in non-null
|};

@observer
export default class WalletSendForm extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  amountFieldReactionDisposer: null | (() => mixed) = null;

  componentDidMount(): void {
    this.props.reset();

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    if (this.props.uriParams) {
      // assert not null
      const uriParams = this.props.uriParams;

      const adjustedAmount = formattedAmountToNaturalUnits(
        uriParams.amount.getDefaultEntry().amount.toString(),
        this.props.defaultToken.Metadata.numberOfDecimals,
      );
      // note: assume these are validated externally
      this.props.updateAmount(Number(adjustedAmount));
      this.props.updateReceiver(getAddressPayload(uriParams.address, this.props.selectedNetwork));
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
        this.form.$('amount').set('value', formatValue(
          totalInput.joinSubtractCopy(fee).getDefaultEntry(),
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
          const updateReceiver = (isValid: bool) => {
            if (isValid) {
              this.props.updateReceiver(
                getAddressPayload(receiverValue, this.props.selectedNetwork)
              );
            } else {
              this.props.updateReceiver();
            }
          };

          const isValid = isValidReceiveAddress(receiverValue, this.props.selectedNetwork);
          if (isValid === true) {
            updateReceiver(true);
            return [isValid];
          }
          updateReceiver(isValid[0]);
          return [isValid[0], this.context.intl.formatMessage(isValid[1])];
        }],
      },
      amount: {
        label: this.context.intl.formatMessage(globalMessages.amountLabel),
        placeholder: this.props.classicTheme ?
          `0.${'0'.repeat(this.props.defaultToken.Metadata.numberOfDecimals)}` : '',
        value: (() => {
          const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
          return this.props.uriParams
            ? formatValue(
              this.props.uriParams.amount.getDefaultEntry(),
            )
            : null
        })(),
        validators: [async ({ field }) => {
          if (this.props.shouldSendAll) {
            // sendall doesn't depend on the amount so always succeed
            return true;
          }

          if (field.value === null) {
            this.props.updateAmount();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = formattedAmountToNaturalUnits(
            field.value.toString(),
            this.props.defaultToken.Metadata.numberOfDecimals,
          );
          const isValidAmount = await this.props.validateAmount(
            formattedAmount,
            this.props.defaultToken
          );
          if (isValidAmount[0]) {
            this.props.updateAmount(Number(formattedAmount));
          } else {
            this.props.updateAmount();
          }
          return isValidAmount;
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
      hasAnyPending,
      classicTheme,
      showMemo,
      onAddMemo
    } = this.props;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const memoField = form.$('memo');
    const amountFieldProps = amountField.bind();

    const transactionFee = this.props.fee ?? new MultiToken([], {
      defaultIdentifier: this.props.defaultToken.Identifier,
      defaultNetworkId: this.props.defaultToken.NetworkId,
    });

    const totalAmount = this.props.totalInput ?? new MultiToken([{
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
      amount: formattedAmountToBigNumber(amountFieldProps.value),
    }], {
      defaultIdentifier: this.props.defaultToken.Identifier,
      defaultNetworkId: this.props.defaultToken.NetworkId,
    });

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
      transactionFeeError = this.context.intl.formatMessage(
        this.props.error,
        this.props.error.values
      );
    }

    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

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
              numberLocaleOptions={{
                minimumFractionDigits: this.props.defaultToken.Metadata.numberOfDecimals,
              }}
              disabled={this.props.shouldSendAll}
              error={(transactionFeeError || amountField.error)}
              // AmountInputSkin props
              currency={getTokenName(this.props.defaultToken)}
              fees={formatValue(transactionFee.getDefaultEntry())}
              total={formatValue(totalAmount.getDefaultEntry())}
              skin={AmountInputSkin}
              classicTheme={classicTheme}
            />
          </div>
          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages.checkboxLabel, {
                currency: getTokenName(this.props.defaultToken)
              })}
              onChange={() => {
                this.props.toggleSendAll();
                if (this.props.shouldSendAll) {
                  this.props.updateAmount(Number(formattedAmountToNaturalUnits(
                    this.form.$('amount').value,
                    this.props.defaultToken.Metadata.numberOfDecimals,
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
