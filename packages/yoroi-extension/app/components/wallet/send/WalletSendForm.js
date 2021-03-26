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
  formattedAmountToNaturalUnits,
  truncateToken,
} from '../../../utils/formatters';
import config from '../../../config';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import LocalizableError from '../../../i18n/LocalizableError';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat, } from 'react-intl';
import { getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists, } from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenEntry,
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import { Select } from 'react-polymorph/lib/components/Select';
import { SelectTokenSkin } from '../../../themes/skins/SelectTokenSkin';
import TokenOptionRow from '../../widgets/tokenOption/TokenOptionRow';
import BigNumber from 'bignumber.js';

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
  memoInvalidOptional: {
    id: 'wallet.transaction.memo.optional.invalid',
    defaultMessage: '!!!Memo cannot be more than {maxMemo} characters.',
  },
});

type Props = {|
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +hasAnyPending: boolean,
  +validateAmount: (
    amountInNaturalUnits: BigNumber,
    tokenRow: $ReadOnly<TokenRow>,
  ) => Promise<[boolean, void | string]>,
  +onSubmit: void => void,
  +totalInput: ?MultiToken,
  +classicTheme: boolean,
  +updateReceiver: (void | string) => void,
  +updateAmount: (?BigNumber) => void,
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
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>, // need since no guarantee input in non-null
  +onAddToken: (void | $ReadOnly<TokenRow>) => void,
  +spendableBalance: ?MultiToken,
  +selectedToken: void | $ReadOnly<TokenRow>,
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

      // note: assume these are validated externally
      this.props.updateAmount(uriParams.amount.getDefaultEntry().amount);
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
        const adjustedInput = totalInput.joinSubtractCopy(fee);
        const relatedEntry = this.getTokenEntry(adjustedInput);
        this.form.$('amount').set('value', formatValue(
          relatedEntry,
        ));
      },
    );
  }

  getTokenEntry: MultiToken => TokenEntry = (tokens) => {
    return this.props.selectedToken == null
      ? tokens.getDefaultEntry()
      : tokens.values.find(
        entry => entry.identifier === this.props.selectedToken?.Identifier
      ) ?? tokens.getDefaultEntry();
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
          `0.${'0'.repeat(this.getNumDecimals())}` : '',
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
          const amountValue: string = field.value;
          if (amountValue === '') {
            this.props.updateAmount();
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          const formattedAmount = new BigNumber(formattedAmountToNaturalUnits(
            amountValue,
            this.getNumDecimals(),
          ));
          const isValidAmount = await this.props.validateAmount(
            formattedAmount,
            this.props.selectedToken ?? this.props.defaultToken
          );
          if (isValidAmount[0]) {
            this.props.updateAmount(formattedAmount);
          } else {
            this.props.updateAmount();
          }
          return isValidAmount;
        }],
      },
      selectedToken: {
        label: this.context.intl.formatMessage(globalMessages.assetSelect),
        value: this.props.selectedToken?.TokenId ?? this.props.getTokenInfo({
          identifier: this.props.defaultToken.Identifier,
          networkId: this.props.defaultToken.NetworkId,
        }).TokenId,
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

  getNumDecimals(): number {
    const info = this.props.selectedToken ?? this.props.getTokenInfo({
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

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
      identifier: (this.props.selectedToken ?? this.props.defaultToken).Identifier,
      networkId: (this.props.selectedToken ?? this.props.defaultToken).NetworkId,
      amount: formattedAmountToBigNumber(amountFieldProps.value)
        .shiftedBy((this.props.selectedToken ?? this.props.defaultToken).Metadata.numberOfDecimals),
    }], {
      defaultIdentifier: this.props.defaultToken.Identifier,
      defaultNetworkId: this.props.defaultToken.NetworkId,
    });

    const pendingTxWarningComponent = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.sendingIsDisabled)}
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

    const tokenOptions = (() => {
      if (this.props.spendableBalance == null) return [];
      const { spendableBalance } = this.props;
      return [
        // make sure default token is always first in the list
        spendableBalance.getDefaultEntry(),
        ...spendableBalance.nonDefaultEntries(),
      ].map(entry => ({
        entry,
        info: this.props.getTokenInfo(entry),
      })).map(token => ({
        value: token.info.TokenId,
        info: token.info,
        label: truncateToken(getTokenStrictName(token.info) ?? getTokenIdentifierIfExists(token.info) ?? '-'),
        id: (getTokenIdentifierIfExists(token.info) ?? '-'),
        amount: genFormatTokenAmount(this.props.getTokenInfo)(token.entry)
      }));
    })();

    return (
      <div className={styles.component}>

        {hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>

          {tokenOptions.length > 1 && (
            <Select
              className={styles.currencySelect}
              options={tokenOptions}
              {...form.$('selectedToken').bind()}
              onChange={tokenId => {
                this.props.onAddToken(tokenOptions.find(
                  token => token.info.TokenId === tokenId
                )?.info);

                // clear send all when changing currencies
                if (this.props.shouldSendAll) {
                  this.props.toggleSendAll();
                }
                // clear amount field when switching currencies
                this.form.$('amount').clear();
                this.props.updateAmount();
              }}
              skin={SelectTokenSkin}
              value={this.props.selectedToken?.TokenId ?? this.props.getTokenInfo({
                identifier: this.props.defaultToken.Identifier,
                networkId: this.props.defaultToken.NetworkId,
              }).TokenId}
              optionRenderer={option => (
                <TokenOptionRow
                  displayName={option.label}
                  id={option.id}
                  amount={option.amount}
                />
              )}
            />
          )}

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
              value={amountFieldProps.value === ''
                ? null
                : formattedAmountToBigNumber(amountFieldProps.value)
              }
              className="amount"
              label={intl.formatMessage(globalMessages.amountLabel)}
              decimalPlaces={this.getNumDecimals()}
              disabled={this.props.shouldSendAll}
              error={(transactionFeeError || amountField.error)}
              // AmountInputSkin props
              currency={truncateToken(
                getTokenName(this.props.selectedToken ?? this.props.defaultToken)
              )}
              fees={formatValue(transactionFee.getDefaultEntry())}
              total={formatValue(this.getTokenEntry(totalAmount))}
              allowSigns={false}
              skin={AmountInputSkin}
              classicTheme={classicTheme}
            />
          </div>
          <div className={styles.checkbox}>
            <Checkbox
              label={intl.formatMessage(messages.checkboxLabel, {
                currency: (this.props.selectedToken == null || this.props.selectedToken.IsDefault)
                  // sending all of the primary asset for the chain sends all assets
                  // since to send all of the primary asset, you have to include all UTXO
                  ? intl.formatMessage(globalMessages.assets)
                  : truncateToken(getTokenName(this.props.selectedToken))
              })}
              onChange={() => {
                this.props.toggleSendAll();
                if (this.props.shouldSendAll) {
                  // if we toggle shouldSendAll from true -> false
                  // we need to re-enable the field
                  // and set it to whatever value was used for the sendAll value
                  this.props.updateAmount(new BigNumber(
                    formattedAmountToNaturalUnits(
                      this.form.$('amount').value,
                      this.getNumDecimals(),
                    )
                  ));
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
