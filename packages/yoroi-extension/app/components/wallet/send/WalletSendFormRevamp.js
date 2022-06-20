// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { Button, Typography } from '@mui/material';
import TextField from '../../common/TextField'
import { defineMessages, intlShape } from 'react-intl';
import { isValidMemoOptional, } from '../../../utils/validations';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { AmountInputRevamp } from '../../common/NumericInputRP';
import styles from './WalletSendFormRevamp.scss';
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
import LocalizableError from '../../../i18n/LocalizableError';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  getTokenName, genFormatTokenAmount, getTokenStrictName, getTokenIdentifierIfExists,
} from '../../../stores/stateless/tokenHelpers';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import SendFormHeader from './SendFormHeader';
import { SEND_FORM_STEP } from '../../../types/WalletSendTypes';
import { isCardanoHaskell, isErgo } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { ReactComponent as PlusIcon } from '../../../assets/images/plus.inline.svg'
import AddNFTDialog from './WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from './WalletSendFormSteps/AddTokenDialog';
import IncludedTokens from './WalletSendFormSteps/IncludedTokens';
import { getNFTs, getTokens } from '../../../utils/wallet';
import type { FormattedNFTDisplay, FormattedTokenDisplay, } from '../../../utils/wallet';
import QRScannerDialog from './WalletSendFormSteps/QRScannerDialog';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { CannotSendBelowMinimumValueError } from '../../../api/common/errors';

const messages = defineMessages({
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
  },
  dropdownAmountLabel: {
    id: 'wallet.send.form.sendAll.dropdownAmountLabel',
    defaultMessage: '!!!Send all {coinName}',
  },
  allTokens: {
    id: 'wallet.send.form.sendAll.allTokens',
    defaultMessage: '!!! + all tokens',
  },
  selectedAmountLable: {
    id: 'wallet.send.form.sendAll.selectedAmountLable',
    defaultMessage: '!!!Amount Options',
  },
  customAmount: {
    id: 'wallet.send.form.sendAll.customAmount',
    defaultMessage: '!!!Custom Amount',
  },
  transactionFeeError: {
    id: 'wallet.send.form.transactionFeeError',
    defaultMessage: '!!!Not enough Ada for fees. Try sending a smaller amount.',
  },
  calculatingFee: {
    id: 'wallet.send.form.calculatingFee',
    defaultMessage: '!!!Calculating the fee, please wait.',
  },
  memoInvalidOptional: {
    id: 'wallet.transaction.memo.optional.invalid',
    defaultMessage: '!!!Memo cannot be more than {maxMemo} characters.',
  },
  willSendAll: {
    id: 'wallet.send.form.willSendAll',
    defaultMessage: '!!!Will Send All Tokens!'
  },
  transactionFee: {
    id: 'wallet.send.form.revamp.transactionFee',
    defaultMessage: '!!!Transaction fee',
  },
  total: {
    id: 'wallet.send.confirmationDialog.totalLabel',
    defaultMessage: '!!!Total',
  },
  nAssets: {
    id: 'wallet.send.form.nAssets',
    defaultMessage: '!!!{number} assets',
  },
  max: {
    id: 'wallet.send.form.max',
    defaultMessage: '!!!MAX',
  },
  minimumRequiredADA: {
    id: 'wallet.send.form.amount.minimumRequiredADA',
    defaultMessage: '!!!The minimum required is {number} ADA'
  }
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
  +updateSendAllStatus: (void | boolean) => void,
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
  +onAddToken: ({|
    token?: $ReadOnly<TokenRow>,
    shouldReset?: boolean,
  |}) => void,
  +onRemoveToken: (void | $ReadOnly<TokenRow>) => void,
  +spendableBalance: ?MultiToken,
  +selectedToken: void | $ReadOnly<TokenRow>,
  +previewStep: () => Node,
  +openDialog: any => void,
  +plannedTxInfoMap: Array<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>,
  +isOpen: any => boolean,
  +closeDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
|};

type State = {|
  showMemoWarning: boolean,
  invalidMemo: boolean,
  memo: string,
  currentStep: number,
|}

@observer
export default class WalletSendForm extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    showMemoWarning: false,
    invalidMemo: false,
    currentStep: SEND_FORM_STEP.RECEIVER
  }

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
        const relatedEntry = adjustedInput.getDefaultEntry();
        this.form.$('amount').set('value', formatValue(
          relatedEntry,
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

  validateDefaultTokenAmount(amount: BigNumber) {
    const MIN_ADA = 1_000_000;
    const { plannedTxInfoMap } = this.props;
    if (
      isCardanoHaskell(this.props.selectedNetwork) &&
      amount.lt(MIN_ADA) &&
      plannedTxInfoMap.length < 2 // when sending only ADA without any additional tokens
    ) {
      return [false, this.context.intl.formatMessage(messages.minimumRequiredADA)]
    }

    return [true, null]
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
          // Amount Field should be optional
          if (!amountValue) {
            this.props.updateAmount();
            const defaultTokenInfo = this.props.getTokenInfo({
              identifier: this.props.defaultToken.Identifier,
              networkId: this.props.defaultToken.NetworkId,
            })

            this.props.onRemoveToken(defaultTokenInfo)
            return true
          }
          const formattedAmount = new BigNumber(formattedAmountToNaturalUnits(
            amountValue,
            this.getNumDecimals(),
          ));
          this.props.updateAmount(formattedAmount);
          return [true, null];
        }],
      }
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
    const info = this.props.getTokenInfo({
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

  getTokensAndNFTs: (MultiToken) => [
    FormattedTokenDisplay[],
    FormattedNFTDisplay[],
  ] = (totalAmount) => {
    if (this.props.shouldSendAll) return [
      getTokens(totalAmount, this.props.getTokenInfo),
      getNFTs(totalAmount, this.props.getTokenInfo)
    ];
    const { plannedTxInfoMap } = this.props;
    const tokens = plannedTxInfoMap.filter(
      ({ token }) => !token.IsNFT && !token.IsDefault
    ).map(({ token, amount }) => {
      const formattedAmount = (new BigNumber(amount))
        .shiftedBy(-token.Metadata.numberOfDecimals)
        .decimalPlaces(token.Metadata.numberOfDecimals)
        .toString()
      return {
        label: truncateToken(getTokenStrictName(token) ?? getTokenIdentifierIfExists(token) ?? '-'),
        amount: formattedAmount,
        info: token,
        id: (getTokenIdentifierIfExists(token) ?? '-'),
      };
    });

    const nfts = plannedTxInfoMap.filter(
      ({ token }) => token.IsNFT
    ).map(({ token }) => {
      const policyId = token.Identifier.split('.')[0];
      const name = truncateToken(getTokenStrictName(token) ?? '-');
      return {
          name,
          // $FlowFixMe[prop-missing]
          image: token.Metadata.assetMintMetadata?.[0]?.['721']?.[policyId]?.[name]?.image,
          info: token,
      };
    });

    return [tokens, nfts]
  }

  getError() {
    const { error, minAda, getTokenInfo } = this.props;
    let errMsg; let values;
    if (!error) return;
    if (error instanceof CannotSendBelowMinimumValueError) {
      const formatValue = genFormatTokenAmount(getTokenInfo);
      const amount = formatValue(minAda.getDefaultEntry());
      errMsg = messages.minimumRequiredADA;
      values = { number: amount }
    } else {
      errMsg = error;
      values = error.values;
    }

    return this.context.intl.formatMessage(errMsg, values);
  }

  renderCurrentStep(step: number): Node {
    const { form } = this;
    const { intl } = this.context;
    const { showMemoWarning, invalidMemo } = this.state
    const {
      shouldSendAll,
      isCalculatingFee,
      getTokenInfo,
      isDefaultIncluded,
    } = this.props
    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const amountFieldProps = amountField.bind();
    const formatValue = genFormatTokenAmount(getTokenInfo);

    const transactionFeeError = this.getError();

    const transactionFee = this.props.fee ?? new MultiToken([], {
      defaultIdentifier: this.props.defaultToken.Identifier,
      defaultNetworkId: this.props.defaultToken.NetworkId,
    });

    const totalAmount = this.props.totalInput ?? new MultiToken([{
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
      amount: formattedAmountToBigNumber(amountFieldProps.value)
        .shiftedBy(this.props.defaultToken.Metadata.numberOfDecimals),
    }], {
      defaultIdentifier: this.props.defaultToken.Identifier,
      defaultNetworkId: this.props.defaultToken.NetworkId,
    });

    const amountInputError = transactionFeeError || amountField.error
    const [tokens, nfts] = this.getTokensAndNFTs(totalAmount)
    switch (step) {
      case SEND_FORM_STEP.RECEIVER:
        return (
          <div className={styles.receiverStep}>
            <div className={styles.receiverInput}>
              <TextField
                className="send_form_receiver"
                {...receiverField.bind()}
                error={receiverField.error}
                done={receiverField.isValid}
                QRHandler={() => this.props.openDialog(QRScannerDialog)}
              />
            </div>
            <div className={styles.memo}>
              <div className={styles.memoInput}>
                <input
                  type="text"
                  onFocus={() => this.setState({ showMemoWarning: true })}
                  placeholder={intl.formatMessage(memoMessages.addMemo)}
                  onChange={(e) => this.onUpdateMemo(e.target.value)}
                />
              </div>
              {invalidMemo ? (
                <p className={styles.memoError}>
                  {intl.formatMessage(messages.memoInvalidOptional,{ maxMemo: MAX_MEMO_SIZE, })}
                </p>
              ):
                <p className={classnames(
                [ styles.memoWarning, !showMemoWarning && styles.hide]
                )}
                >
                  {intl.formatMessage(memoMessages.memoWarning)}
                </p>
              }
            </div>
            <div>
              {this._nextStepButton(
                invalidMemo || !receiverField.isValid,
                () => this.onUpdateStep(SEND_FORM_STEP.AMOUNT)
              )}
            </div>
          </div>
        )
        case SEND_FORM_STEP.AMOUNT:
          return (
            <div className={styles.amountStep}>
              {isCalculatingFee && (
                <p className={styles.calculatingFee}>
                  {intl.formatMessage(messages.calculatingFee)}
                </p>
              )}

              {!isDefaultIncluded && (
                <p className={styles.sendError}>
                  {transactionFeeError}
                </p>
              )}
              <div className={classnames(
                [styles.amountInput,
                  amountInputError && isDefaultIncluded && styles.amountInputError,
                  shouldSendAll && styles.disabled
                ])}
              >
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '-10px',
                    left: '6px',
                    backgroundColor: 'var(--yoroi-palette-common-white)',
                    paddingX: '4px',
                    color: shouldSendAll && 'var(--yoroi-comp-input-text-disabled)'
                  }}
                  fontSize='12px'
                >
                  {intl.formatMessage(globalMessages.amountLabel)}
                </Typography>
                <div className={styles.amountInputGrid}>
                  <AmountInputRevamp
                    {...amountFieldProps}
                    value={amountFieldProps.value === ''
                      ? null
                      : formattedAmountToBigNumber(amountFieldProps.value)}
                    className="send_form_amount"
                    label={intl.formatMessage(globalMessages.amountLabel)}
                    decimalPlaces={this.getNumDecimals()}
                    disabled={shouldSendAll}
                    error={amountInputError}
                    currency={truncateToken(
                      getTokenName(this.props.defaultToken)
                    )}
                    fees={formatValue(transactionFee.getDefaultEntry())}
                    total={formatValue(totalAmount.getDefaultEntry())}
                    allowSigns={false}
                    onFocus={() => {
                      this.props.onAddToken({
                        shouldReset: false,
                      });
                    }}
                    onBlur={() => {
                      // Remove default token if now amount entered
                      if (!amountField.value) this.props.onRemoveToken();
                    }}
                    amountFieldRevamp
                    placeholder='0.0'
                  />
                  <p className={styles.defaultCoin}>
                    {isErgo(this.props.selectedNetwork) ? 'ERG' : 'ADA'}
                  </p>
                  <Button
                    variant="ternary"
                    sx={{
                      minWidth: '56px',
                      minHeight: '30px',
                      border: 'none',
                      background: `var(--yoroi-palette-gray-${shouldSendAll ? '900' : '50'})`,
                      color: shouldSendAll && '#FFFFFF',
                      '&:hover': {
                        background: `var(--yoroi-palette-gray-${shouldSendAll ? '800' : '100'})`,
                      }
                    }}
                    onClick={() => {
                      if (shouldSendAll) {
                        amountField.reset();
                        this.props.onRemoveToken(); // remove default token
                      } else {
                        this.props.onAddToken({
                          shouldReset: true,
                        });
                        this.props.updateSendAllStatus(true);
                      }
                    }}
                  >
                    {intl.formatMessage(messages.max)}
                  </Button>
                </div>
                {this.props.unitOfAccountSetting.enabled && (
                <div className={styles.fiat}>
                  {this.renderUnitOfAccountAmount(amountFieldProps.value)}
                </div>)}
                {isDefaultIncluded && (
                  <p className={styles.amountError}>
                    {amountInputError}
                  </p>)}
              </div>

              <IncludedTokens
                tokens={tokens}
                nfts={nfts}
                onRemoveToken={this.props.onRemoveToken}
                shouldSendAll={shouldSendAll}
              />

              <div className={styles.addButtonsWrapper}>
                <Button
                  variant="ternary"
                  sx={{ width: '160px', marginRight: '16px' }}
                  onClick={() => this.props.openDialog(AddTokenDialog)}
                  disabled={this.props.shouldSendAll}
                >
                  <PlusIcon />
                  <p className={styles.btnText}>{intl.formatMessage(globalMessages.token)}</p>
                </Button>
                <Button
                  variant="ternary"
                  sx={{ width: '160px' }}
                  onClick={() => this.props.openDialog(AddNFTDialog)}
                  disabled={this.props.shouldSendAll}
                >
                  <PlusIcon />
                  <p className={styles.btnText}>{intl.formatMessage(globalMessages.nfts)}</p>
                </Button>
              </div>

              {this._nextStepButton(
               !this.props.fee || this.props.hasAnyPending || invalidMemo,
               () => {
                this.props.onSubmit()
                this.onUpdateStep(SEND_FORM_STEP.PREVIEW)
               })}
            </div>
          )
        case SEND_FORM_STEP.PREVIEW:
            return this.props.previewStep()
        default:
          throw Error(`${step} is not a valid step`)
    }
  }

  render(): Node {
    const { currentStep } = this.state
    return (
      <>
        {this.renderDialog()}
        <div className={styles.component}>
          <div className={styles.wrapper}>
            <SendFormHeader
              step={currentStep}
              onUpdateStep={this.onUpdateStep.bind(this)}
            />

            <div className={styles.formBody}>
              {this.renderCurrentStep(currentStep)}
            </div>
          </div>
        </div>
      </>
    );
  }

  renderDialog(): Node {
    const { form } = this
    const receiverField = form.$('receiver');

    if (this.props.isOpen(QRScannerDialog)) {
      return (
        <QRScannerDialog
          onClose={this.props.closeDialog}
          onReadQR={(address) => { receiverField.set('value', address) }}
        />
      )
    }
    return ''
  }
  onUpdateStep(step: number) {
    if (step > 3) throw new Error('Invalid Step number.')
    this.setState({ currentStep: step })
  }

  onUpdateMemo(memo: string) {
    const isValid = isValidMemoOptional(memo);
    this.props.updateMemo(memo);
    this.setState({ invalidMemo: !isValid })
  }

  _nextStepButton(
    disabledCondition: boolean,
    nextStep: () => void
  ): Node {
    const { intl } = this.context;

    return (
      <Button
        variant="primary"
        onClick={nextStep}
        /** Next Action can't be performed in case transaction fees are not calculated
          * or there's a transaction waiting to be confirmed (pending) */
        disabled={disabledCondition}
        sx={{ margin: '125px 0px 0px 0px', display: 'block' }}
      >
        {intl.formatMessage(globalMessages.nextButtonLabel)}
      </Button>);
  }

  renderUnitOfAccountAmount(value: string): Node {
    let convertedAmount;

    const { currency } = this.props.unitOfAccountSetting;

    let amount;
    try{
      amount = new BigNumber(value);
    } catch {
      amount = null;
    }
    if (!amount || amount.isNaN()) {
      convertedAmount = '-';
    } else {
      const ticker = this.props.defaultToken.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getCurrentPrice(ticker, currency);

      if (price != null) {
        convertedAmount = calculateAndFormatValue(amount, price);
      } else {
        convertedAmount = '-';
      }
    }

    return `${convertedAmount} ${currency}`;
  }
}
