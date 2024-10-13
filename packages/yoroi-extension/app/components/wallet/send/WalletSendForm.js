// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { Button, MenuItem, Typography } from '@mui/material';
import TextField from '../../common/TextField';
import { defineMessages, intlShape } from 'react-intl';
import { isValidMemoOptional, isValidMemo } from '../../../utils/validations';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { AmountInput } from '../../common/NumericInputRP';
import { ReactComponent as AddMemoSvg } from '../../../assets/images/add-memo.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import styles from './WalletSendForm.scss';
import globalMessages, { memoMessages } from '../../../i18n/global-messages';
import type { UriParams } from '../../../utils/URIHandling';
import {
  getAddressPayload,
  isValidReceiveAddress,
} from '../../../api/ada/lib/storage/bridge/utils';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits,
  truncateToken,
} from '../../../utils/formatters';
import config from '../../../config';
import LocalizableError from '../../../i18n/LocalizableError';
import WarningBox from '../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  getTokenName,
  genFormatTokenAmount,
  getTokenStrictName,
  getTokenIdentifierIfExists,
} from '../../../stores/stateless/tokenHelpers';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenEntry, TokenLookupKey } from '../../../api/common/lib/MultiToken';
import Select from '../../common/Select';
import { Box } from '@mui/system';
import TokenOptionRow from '../../widgets/tokenOption/TokenOptionRow';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';

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
    defaultMessage: '!!!Send all {currency}',
  },
  dropdownSendNFTLabel: {
    id: 'wallet.send.form.sendAll.dropdownSendNFTLabel',
    defaultMessage: '!!!Send {currency}',
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
    defaultMessage: '!!!ATTENTION! You will send all of your tokens below:',
  },
});

type Props = {|
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +hasAnyPending: boolean,
  +validateAmount: (
    amountInNaturalUnits: BigNumber,
    tokenRow: $ReadOnly<TokenRow>
  ) => Promise<[boolean, void | string]>,
  +onSubmit: void => void,
  +totalInput: ?MultiToken,
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
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>, // need since no guarantee input in non-null
  +onAddToken: ({|
    token: void | $ReadOnly<TokenRow>,
    shouldSendAll?: boolean,
    shouldReset?: boolean,
  |}) => void,
  +spendableBalance: ?MultiToken,
  +selectedToken: void | $ReadOnly<TokenRow>,
|};
const CUSTOM_AMOUNT = 'CUSTOM_AMOUNT';

@observer
export default class WalletSendForm extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
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
        this.form.$('amount').set('value', formatValue(relatedEntry));
      }
    );
  }

  getTokenEntry: MultiToken => TokenEntry = tokens => {
    return this.props.selectedToken == null
      ? tokens.getDefaultEntry()
      : tokens.values.find(entry => entry.identifier === this.props.selectedToken?.Identifier) ??
          tokens.getDefaultEntry();
  };

  componentWillUnmount(): void {
    this.props.reset();
    // dispose reaction
    if (this.amountFieldReactionDisposer != null) {
      this.amountFieldReactionDisposer();
    }
  }

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        receiver: {
          label: this.context.intl.formatMessage(messages.receiverLabel),
          placeholder: '',
          value: this.props.uriParams ? this.props.uriParams.address : '',
          validators: [
            ({ field }) => {
              const receiverValue = field.value;
              if (receiverValue === '') {
                this.props.updateReceiver();
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              const updateReceiver = (isValid: boolean) => {
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
            },
          ],
        },
        amount: {
          label: this.context.intl.formatMessage(globalMessages.amountLabel),
          placeholder: '',
          value: (() => {
            const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
            return this.props.uriParams
              ? formatValue(this.props.uriParams.amount.getDefaultEntry())
              : null;
          })(),
          validators: [
            async ({ field }) => {
              if (this.props.shouldSendAll) {
                // sendall doesn't depend on the amount so always succeed
                return true;
              }
              const amountValue: string = field.value;
              if (amountValue === '') {
                this.props.updateAmount();
                return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
              }
              const formattedAmount = new BigNumber(
                formattedAmountToNaturalUnits(amountValue, this.getNumDecimals())
              );
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
            },
          ],
        },
        selectedToken: {
          label: this.context.intl.formatMessage(globalMessages.assetSelect),
          value:
            this.props.selectedToken?.TokenId ??
            this.props.getTokenInfo({
              identifier: this.props.defaultToken.Identifier,
              networkId: this.props.defaultToken.NetworkId,
            }).TokenId,
        },
        selectedAmount: {
          label: this.context.intl.formatMessage(messages.selectedAmountLable),
          value: this.props.shouldSendAll
            ? this.props.selectedToken?.TokenId ??
              this.props.getTokenInfo({
                identifier: this.props.defaultToken.Identifier,
                networkId: this.props.defaultToken.NetworkId,
              }).TokenId
            : CUSTOM_AMOUNT,
        },
        memo: {
          label: this.context.intl.formatMessage(memoMessages.memoLabel),
          placeholder: this.context.intl.formatMessage(memoMessages.optionalMemo),
          value: '',
          validators: [
            ({ field }) => {
              const memoContent = field.value;
              const isValid = isValidMemoOptional(memoContent);
              if (isValid) {
                this.props.updateMemo(memoContent);
              }
              return [
                isValid,
                this.context.intl.formatMessage(messages.memoInvalidOptional, {
                  maxMemo: MAX_MEMO_SIZE,
                }),
              ];
            },
          ],
        },
      },
    },
    {
      options: {
        // if fields are pre-populated by URI, validate them right away
        showErrorsOnInit: this.props.uriParams,
        validateOnBlur: false,
        validateOnChange: true,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  getNumDecimals(): number {
    const info =
      this.props.selectedToken ??
      this.props.getTokenInfo({
        identifier: this.props.defaultToken.Identifier,
        networkId: this.props.defaultToken.NetworkId,
      });
    return info.Metadata.numberOfDecimals;
  }

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const { memo } = this.form.values();
    const { hasAnyPending, showMemo, onAddMemo } = this.props;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const memoField = form.$('memo');
    const amountFieldProps = amountField.bind();

    const transactionFee =
      this.props.fee ??
      new MultiToken([], {
        defaultIdentifier: this.props.defaultToken.Identifier,
        defaultNetworkId: this.props.defaultToken.NetworkId,
      });

    const totalAmount =
      this.props.totalInput ??
      new MultiToken(
        [
          {
            identifier: (this.props.selectedToken ?? this.props.defaultToken).Identifier,
            networkId: (this.props.selectedToken ?? this.props.defaultToken).NetworkId,
            amount: formattedAmountToBigNumber(amountFieldProps.value).shiftedBy(
              (this.props.selectedToken ?? this.props.defaultToken).Metadata.numberOfDecimals
            ),
          },
        ],
        {
          defaultIdentifier: this.props.defaultToken.Identifier,
          defaultNetworkId: this.props.defaultToken.NetworkId,
        }
      );

    const pendingTxWarningComponent = (
      <div className={styles.warningBox}>
        <WarningBox>{intl.formatMessage(globalMessages.sendingIsDisabled)}</WarningBox>
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
      ]
        .map(entry => ({
          entry,
          info: this.props.getTokenInfo(entry),
        }))
        .map(token => {
          const amount = genFormatTokenAmount(this.props.getTokenInfo)(token.entry);
          return {
            value: token.info.TokenId,
            info: token.info,
            label: truncateToken(
              getTokenStrictName(token.info).name ?? getTokenIdentifierIfExists(token.info) ?? '-'
            ),
            id: getTokenIdentifierIfExists(token.info) ?? '-',
            amount,
          };
        });
    })();

    const tokenId =
      this.props.selectedToken?.TokenId ??
      this.props.getTokenInfo({
        identifier: this.props.defaultToken.Identifier,
        networkId: this.props.defaultToken.NetworkId,
      }).TokenId;

    const sendAmountOptions = (() => {
      return [
        {
          id: 'custom-amount',
          label: intl.formatMessage(messages.customAmount),
          value: CUSTOM_AMOUNT,
        },
        ...tokenOptions
          .filter(t => t.value === tokenId)
          .map(token => {
            let label = intl.formatMessage(
              token.info.IsNFT ? messages.dropdownSendNFTLabel : messages.dropdownAmountLabel,
              {
                currency: truncateToken(token.label),
              }
            );

            const defaultTokenName = truncateToken(getTokenName(this.props.defaultToken));
            if (token.label === defaultTokenName) {
              label += intl.formatMessage(messages.allTokens);
            }
            return {
              label,
              value: token.value,
              id: 'send-all',
            };
          }),
      ];
    })();
    const tokenListClasses = classnames([
      styles.tokenList,
      {
        [styles.show]: this.props.shouldSendAll && this.form.$('selectedToken').value === tokenId,
      },
    ]);

    return (
      <div className={styles.component}>
        {hasAnyPending && pendingTxWarningComponent}

        <BorderedBox>
          {tokenOptions.length > 1 && (
            <Select
              formControlProps={{ sx: { marginBottom: '10px' } }}
              labelId="token-assets-select"
              {...form.$('selectedToken').bind()}
              onChange={value => {
                const token = tokenOptions.find(t => t.info.TokenId === value);
                if (!token) return;

                this.props.onAddToken({
                  token: token?.info,
                  shouldSendAll: token.info.IsNFT === true,
                  shouldReset: true,
                });

                if (token.info.IsNFT) {
                  this.form.$('amount').value = token.amount;
                  this.form.$('selectedAmount').value = token.value;
                } else {
                  this.form.$('amount').clear();
                  this.form.$('selectedAmount').value = CUSTOM_AMOUNT;
                  this.props.updateAmount();
                }
              }}
              value={
                this.props.selectedToken?.TokenId ??
                this.props.getTokenInfo({
                  identifier: this.props.defaultToken.Identifier,
                  networkId: this.props.defaultToken.NetworkId,
                }).TokenId
              }
              renderValue={value => (
                <Box id="tokenAssetsSelect">
                  {tokenOptions.filter(option => option.value === value)[0]?.label}
                </Box>
              )}
            >
              <MenuItem
                sx={{ height: '50px', '&.Mui-disabled': { opacity: 0.8 } }}
                value=""
                disabled
              >
                <Box width="100%" display="flex">
                  <Typography component="div" variant="body2" flex="1">
                    {intl.formatMessage(globalMessages.name)}
                  </Typography>
                  <Typography component="div" variant="body2" flex="1">
                    {intl.formatMessage(globalMessages.amount)}
                  </Typography>
                </Box>
              </MenuItem>
              {tokenOptions.map(option => (
                <MenuItem sx={{ height: '70px' }} key={option.value} value={option.value}>
                  <TokenOptionRow
                    displayName={option.label}
                    id={option.id}
                    amount={option.amount}
                  />
                </MenuItem>
              ))}
            </Select>
          )}

          <div className={styles.receiverInput}>
            <TextField
              className="receiver"
              {...receiverField.bind()}
              error={receiverField.error}
              done={receiverField.isValid}
            />
          </div>

          <div className={styles.amountInput}>
            <AmountInput
              {...amountFieldProps}
              value={
                amountFieldProps.value === ''
                  ? null
                  : formattedAmountToBigNumber(amountFieldProps.value)
              }
              className="amount"
              label={intl.formatMessage(globalMessages.amountLabel)}
              decimalPlaces={this.getNumDecimals()}
              disabled={this.props.shouldSendAll}
              error={transactionFeeError || amountField.error}
              currency={truncateToken(
                getTokenName(this.props.selectedToken ?? this.props.defaultToken)
              )}
              fees={formatValue(transactionFee.getDefaultEntry())}
              total={formatValue(this.getTokenEntry(totalAmount))}
              allowSigns={false}
            />
          </div>

          <Select
            {...form.$('selectedAmount').bind()}
            labelId="amount-options-select"
            disabled={this.props.selectedToken?.IsNFT}
            renderValue={value => (
              <Typography component="div" sx={{ textTransform: 'uppercase' }}>
                {sendAmountOptions.find(item => item.value === value)?.label ?? '-'}
              </Typography>
            )}
            onChange={value => {
              // Do nothing if we select the same option twice
              if (this.form.$('selectedAmount').value === value) return;
              if (value === CUSTOM_AMOUNT) {
                this.props.updateSendAllStatus(false);
              } else {
                // if we switched shouldSendAll from true -> false
                // we need to re-enable the field
                // and set it to whatever value was used for the sendAll value
                this.props.updateSendAllStatus(true);
              }

              if (this.props.shouldSendAll) {
                this.props.updateAmount(
                  new BigNumber(
                    formattedAmountToNaturalUnits(
                      this.form.$('amount').value,
                      this.getNumDecimals()
                    )
                  )
                );
              }

              this.form.$('selectedAmount').value = value;
            }}
          >
            {sendAmountOptions.map(option => (
              <MenuItem key={option.value} value={option.value} id={option.id}>
                <TokenOptionRow displayName={option.label} nameOnly />
              </MenuItem>
            ))}
          </Select>

          <div className={tokenListClasses}>
            <h1>{intl.formatMessage(messages.willSendAll)}</h1>
            {tokenOptions.map(token => (
              <div key={token.id}>
                {token.amount} {token.label}
              </div>
            ))}
          </div>

          {showMemo ? (
            <div>
              <TextField
                className="memo"
                {...memoField.bind()}
                error={memoField.error}
                done={isValidMemo(memo)}
              />
            </div>
          ) : (
            <div className={styles.memoActionItemBlock}>
              <button className="addMemoButton" type="button" onClick={onAddMemo}>
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
    const { memo, amount } = this.form.values();

    const { hasAnyPending } = this.props;

    const disabledCondition =
      !this.props.fee || hasAnyPending || !isValidMemoOptional(memo) || !amount;

    return (
      <Button
        variant="primary"
        onClick={this.props.onSubmit}
        /** Next Action can't be performed in case transaction fees are not calculated
         * or there's a transaction waiting to be confirmed (pending) */
        disabled={disabledCondition}
        sx={{ margin: '30px auto 0', display: 'block' }}
      >
        {intl.formatMessage(globalMessages.nextButtonLabel)}
      </Button>
    );
  }
}
