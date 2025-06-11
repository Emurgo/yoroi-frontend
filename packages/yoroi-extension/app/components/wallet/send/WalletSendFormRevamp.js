// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { action, reaction } from 'mobx';
import { Button, Typography, TextField as MemoTextField, Box, styled } from '@mui/material';
import TextField from '../../common/TextField';
import { defineMessages, IntlContext } from 'react-intl';
import { isValidMemoOptional } from '../../../utils/validations';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import { AmountInputRevamp } from '../../common/NumericInputRP';
import styles from './WalletSendFormRevamp.scss';
import globalMessages, { memoMessages } from '../../../i18n/global-messages';
import type { UriParams } from '../../../utils/URIHandling';
import { getAddressPayload, isValidReceiveAddress } from '../../../api/ada/lib/storage/bridge/utils';
import { MAX_MEMO_SIZE } from '../../../config/externalStorageConfig';
import type { TokenRow, NetworkRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  formattedAmountToBigNumber,
  formattedAmountToNaturalUnits,
  truncateAddressShort,
  truncateToken,
} from '../../../utils/formatters';
import config from '../../../config';
import LocalizableError from '../../../i18n/LocalizableError';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import {
  getTokenName,
  genFormatTokenAmount,
  getTokenStrictName,
  getTokenIdentifierIfExists,
} from '../../../stores/stateless/tokenHelpers';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../../api/common/lib/MultiToken';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import SendFormHeader from './SendFormHeader';
import { SEND_FORM_STEP } from '../../../types/WalletSendTypes';
import { ReactComponent as PlusIcon } from '../../../assets/images/plus.inline.svg';
import AddNFTDialog from './WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from './WalletSendFormSteps/AddTokenDialog';
import IncludedTokens from './WalletSendFormSteps/IncludedTokens';
import { getNFTs, getTokens } from '../../../utils/wallet';
import type { FormattedNFTDisplay, FormattedTokenDisplay } from '../../../utils/wallet';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { CannotSendBelowMinimumValueError } from '../../../api/common/errors';
import { getImageFromTokenMetadata } from '../../../utils/nftMetadata';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import { ampli } from '../../../../ampli/index';
import type { DomainResolverFunc, DomainResolverResponse } from '../../../stores/ada/AdaAddressesStore';
import { isResolvableDomain } from '@yoroi/resolver';
import SupportedAddressDomainsBanner from '../../../containers/wallet/SupportedAddressDomainsBanner';
import type { MaxSendableAmountRequest } from '../../../stores/toplevel/TransactionBuilderStore';
import type { WalletState } from '../../../../chrome/extension/background/types';
import LoadingSpinner from '../../widgets/LoadingSpinner';
import { SendTokensButton } from './SendTokensButton';

const messages = defineMessages({
  receiverLabel: {
    id: 'wallet.send.form.receiver.label',
    defaultMessage: '!!!Receiver',
  },
  receiverHint: {
    id: 'wallet.send.form.receiver.hint',
    defaultMessage: '!!!Wallet Address',
  },
  receiverFieldLabelDefault: {
    id: 'wallet.send.form.receiver.label.inactive',
    defaultMessage: '!!!Receiver address',
  },
  receiverFieldLabelResolverSupported: {
    id: 'wallet.send.form.receiver.label.resolverSupported',
    defaultMessage: '!!!Receiver address, ADA Handle, or domains',
  },
  receiverFieldLabelUnresolvedAddress: {
    id: 'wallet.send.form.receiver.label.unresolvedAddress',
    defaultMessage: "!!!Receiver address, ADA Handle or domain you entered doesn't exist. Please double-check it and try again",
  },
  receiverFieldLabelForbiddenAccess: {
    id: 'wallet.send.form.receiver.label.forbiddenAccess',
    defaultMessage: '!!!access forbidden, you might need a VPN',
  },
  receiverFieldLabelUnexpectedError: {
    id: 'wallet.send.form.receiver.label.unexpectedError',
    defaultMessage: '!!!unexpected error',
  },
  receiverFieldLabelInvalidAddress: {
    id: 'wallet.send.form.receiver.label.invalidAddress',
    defaultMessage: '!!!Please enter a valid receiver address, ADA Handle or domain',
  },
  receiverFieldLabelResolvedAddress: {
    id: 'wallet.send.form.receiver.label.resolvedAddress',
    defaultMessage: '!!!Related address',
  },
  memoFieldLabelInactive: {
    id: 'wallet.send.form.memo.label.inactive',
    defaultMessage: '!!!Enter memo',
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
    id: 'wallet.revamp.transaction.memo.optional.invalid',
    defaultMessage: '!!!Memo name is too long',
  },
  willSendAll: {
    id: 'wallet.send.form.willSendAll',
    defaultMessage: '!!!Will Send All Tokens!',
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
    defaultMessage: '!!!Minimum required is {number} ADA',
  },
});

// <TODO:REORGANISE> too many props
type Props = {|
  +stores: any,
  +resolveDomainAddress: ?DomainResolverFunc,
  +supportedAddressDomainBannerState: {|
    isDisplayed: boolean,
    onClose: () => void,
  |},
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +selectedWallet: WalletState,
  +selectedExplorer: Map<number, SelectedExplorer>,
  +hasAnyPending: boolean,
  +onSubmit: void => void,
  +totalInput: ?MultiToken,
  +updateReceiver: (void | string, void | {| handle: string, nameServer: string |}) => void,
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
  +memo: void | string,
  +showMemo: boolean,
  +onAddMemo: void => void,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>, // need since no guarantee input in non-null
  +onAddToken: ({|
    token?: $ReadOnly<TokenRow>,
    shouldSendAll?: boolean,
    shouldReset?: boolean,
  |}) => void,
  +onRemoveTokens: (Array<$ReadOnly<TokenRow>>) => void,
  +spendableBalance: ?MultiToken,
  +selectedToken: void | $ReadOnly<TokenRow>,
  +openDialog: any => void,
  +plannedTxInfoMap: Array<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>,
  +isDefaultIncluded: boolean,
  +minAda: ?MultiToken,
  +isOpen: any => boolean,
  +closeDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +maxSendableAmount: MaxSendableAmountRequest,
  +calculateMaxAmount: void => Promise<void>,
  +signRequest: null | ISignRequest<any>,
  +staleTx: boolean,
  +openTransactionSuccessDialog: void => void,
|};

const SMemoTextField = styled(MemoTextField)(({ theme }) => ({
  'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active': {
    WebkitBoxShadow: `0 0 0 30px ${theme.palette.ds.bg_color_max} inset !important`,
  },
}));

const STextField = styled(TextField)(({ theme }) => ({
  'input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active,input:-webkit-autofill:selected': {
    WebkitBoxShadow: `0 0 0 30px ${theme.palette.ds.bg_color_max} inset !important`,
    '-webkit-text-fill-color': `${theme.palette.ds.text_gray_medium}`,
  },
  '& .MuiFormHelperText-root': {
    marginInline: 0,
    mt: 0.5,
    fontSize: '0.750rem',
    lineHeight: '1rem',
    letterSpacing: '0.2px',
  },
}));

type State = {|
  currentStep: number,
  invalidMemo: boolean,
  isMemoFieldActive: boolean,
  domainResolverResult: ?{|
    nameServer: string,
    handle: string,
    address: string,
  |},
  domainResolverMessage: ?string,
  domainResolverIsLoading: boolean,
  lastValidatedValue: ?string,
|};

@observer
export default class WalletSendFormRevamp extends Component<Props, State> {
  static contextType:any = IntlContext;
  state: State = {
    invalidMemo: false,
    currentStep: SEND_FORM_STEP.RECEIVER,
    isMemoFieldActive: false,
    domainResolverResult: null,
    domainResolverMessage: null,
    domainResolverIsLoading: false,
    lastValidatedValue: null,
  };
  maxStep: number = SEND_FORM_STEP.RECEIVER;

  bodyRef: any | null = null;

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
      () => [this.props.shouldSendAll, this.props.totalInput, this.props.maxSendableAmount.result],
      () => {
        const { maxSendableAmount } = this.props;
        const amountField = this.form.$('amount');
        if (maxSendableAmount.result) {
          const numberOfDecimals = this.getNumDecimals();
          amountField.set(
            'value',
            maxSendableAmount.result?.shiftedBy(-numberOfDecimals).decimalPlaces(numberOfDecimals).toString()
          );
        } else if (maxSendableAmount.error) {
          amountField.set('value', '0');
        }

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
        amountField.set('value', formatValue(relatedEntry));
      }
    );
  }

  componentWillUnmount(): void {
    this.props.reset();
    // dispose reaction
    if (this.amountFieldReactionDisposer != null) {
      this.amountFieldReactionDisposer();
    }
  }

  @action async resolveDomainAddress(
    handle: string
  ): Promise<{|
    isDomainResolvable: boolean,
    domainResolverMessage: ?string,
    resolvedAddress: ?string,
    resolvedNameServer: ?string,
  |}> {
    let isDomainResolvable = false;
    let domainResolverMessage = null;
    let resolvedAddress = null;
    let resolvedNameServer = null;
    const { resolveDomainAddress } = this.props;
    if (resolveDomainAddress != null) {
      isDomainResolvable = isResolvableDomain(handle);
      let domainResolverResult = null;
      if (isDomainResolvable) {
        this.setState({ domainResolverIsLoading: true });
        const res: ?DomainResolverResponse = await resolveDomainAddress(handle);
        if (res == null) {
          domainResolverMessage = this.context.formatMessage(messages.receiverFieldLabelUnresolvedAddress);
        } else if (res.address != null) {
          resolvedAddress = res.address;
          resolvedNameServer = res.nameServer;
          domainResolverResult = {
            handle,
            address: res.address,
            nameServer: res.nameServer,
          };
        } else if (res.error === 'forbidden') {
          domainResolverMessage = `${res.nameServer}: ${this.context.formatMessage(
            messages.receiverFieldLabelForbiddenAccess
          )}`;
        } else {
          domainResolverMessage = `${res.nameServer}: ${this.context.formatMessage(
            messages.receiverFieldLabelUnexpectedError
          )}`;
        }
      }
      this.setState({
        domainResolverResult,
        domainResolverMessage,
        domainResolverIsLoading: false,
      });
    }
    return {
      isDomainResolvable,
      domainResolverMessage,
      resolvedAddress,
      resolvedNameServer,
    };
  }

  // FORM VALIDATION
  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        receiver: {
          label: this.context.formatMessage(messages.receiverFieldLabelDefault),
          placeholder: '',
          value: this.props.uriParams ? this.props.uriParams.address : '',
          validators: [
            async ({ field }) => {
              field.value = field.value.trim();
              const inputFieldValue = field.value;
              let handle = undefined;
              let receiverValue = inputFieldValue;
              try {
                if (receiverValue === '') {
                  this.props.updateReceiver();
                  this.setState({
                    domainResolverResult: null,
                    domainResolverMessage: null,
                    domainResolverIsLoading: false,
                  });
                  return [false, this.context.formatMessage(globalMessages.fieldIsRequired)];
                }
                const updateReceiver = (isValid: boolean) => {
                  if (isValid) {
                    this.props.updateReceiver(getAddressPayload(receiverValue, this.props.selectedNetwork), handle);
                  } else {
                    this.props.updateReceiver();
                  }
                };

                // DOMAIN RESOLVER
                const { isDomainResolvable, domainResolverMessage, resolvedAddress, resolvedNameServer } =
                  // $FlowIgnore[incompatible-call]
                  await this.resolveDomainAddress(receiverValue);

                if (resolvedAddress != null) {
                  handle = { handle: receiverValue, nameServer: resolvedNameServer };
                  receiverValue = resolvedAddress;
                }
                ////////////////////

                const isValid = isValidReceiveAddress(receiverValue, this.props.selectedNetwork);
                if (isValid === true) {
                  updateReceiver(true);
                  return [isValid];
                }
                const [result, errorMessage, errorType] = isValid;
                updateReceiver(result);
                const fieldError = isDomainResolvable
                  ? domainResolverMessage
                  : this.context.formatMessage(errorType === 1 ? messages.receiverFieldLabelInvalidAddress : errorMessage);
                return [isValid[0], fieldError];
              } finally {
                this.setState({
                  lastValidatedValue: inputFieldValue,
                });
              }
            },
          ],
        },
        amount: {
          label: this.context.formatMessage(globalMessages.amountLabel),
          placeholder: '',
          value: (() => {
            const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
            return this.props.uriParams ? formatValue(this.props.uriParams.amount.getDefaultEntry()) : null;
          })(),
          validators: [
            async ({ field }) => {
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
                });

                this.props.onRemoveTokens([defaultTokenInfo]);
                return true;
              }
              const formattedAmount = new BigNumber(formattedAmountToNaturalUnits(amountValue, this.getNumDecimals()));
              this.props.updateAmount(formattedAmount);
              return [true, null];
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
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT_LONGER
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  getNumDecimals(): number {
    const info = this.props.getTokenInfo({
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

  setMemoFieldStatus: boolean => void = isMemoFieldActive => {
    this.setState({ isMemoFieldActive });
  };

  getTokensAndNFTs: MultiToken => [FormattedTokenDisplay[], FormattedNFTDisplay[]] = totalAmount => {
    if (this.props.shouldSendAll)
      return [getTokens(totalAmount, this.props.getTokenInfo), getNFTs(totalAmount, this.props.getTokenInfo)];
    const { plannedTxInfoMap } = this.props;
    const tokens = plannedTxInfoMap
      .filter(({ token }) => token.IsNFT === false && token.IsDefault === false)
      .map(({ token, amount }) => {
        const formattedAmount = amount
          ? new BigNumber(amount)
              .shiftedBy(-token.Metadata.numberOfDecimals)
              .decimalPlaces(token.Metadata.numberOfDecimals)
              .toString()
          : undefined;

        return {
          label: truncateToken(getTokenStrictName(token).name ?? getTokenIdentifierIfExists(token) ?? '-'),
          amount: formattedAmount,
          info: token,
          id: getTokenIdentifierIfExists(token) ?? '-',
        };
      });

    const nfts = plannedTxInfoMap
      .filter(({ token }) => token.IsNFT === true)
      .map(({ token }) => {
        const split = token.Identifier.split('.');
        const policyId = split[0];
        const hexName = split[1] ?? '';
        const fullName = getTokenStrictName(token).name;
        const name = truncateToken(fullName ?? '-');
        return {
          name,
          image: getImageFromTokenMetadata(policyId, hexName, token.Metadata),
          info: token,
        };
      });

    return [tokens, nfts];
  };

  getError(): string | null {
    const { error, minAda, getTokenInfo } = this.props;
    if (!error) return null;

    let errMsg;
    let values;
    if (error instanceof CannotSendBelowMinimumValueError && minAda) {
      const formatValue = genFormatTokenAmount(getTokenInfo);
      const amount = formatValue(minAda.getDefaultEntry());
      errMsg = messages.minimumRequiredADA;
      values = { number: amount };
    } else {
      errMsg = error;
      values = error.values;
    }

    return this.context.formatMessage(errMsg, values);
  }

  renderCurrentStep(step: number): Node {
    const { form } = this;
    const intl = this.context;
    const { invalidMemo } = this.state;
    const {
      shouldSendAll,
      isCalculatingFee,
      getTokenInfo,
      isDefaultIncluded,
      maxSendableAmount,
      spendableBalance,
      memo,
    } = this.props;

    const amountField = form.$('amount');
    const receiverField = form.$('receiver');
    const amountFieldProps = amountField.bind();
    const formatValue = genFormatTokenAmount(getTokenInfo);

    const transactionFeeError = this.getError();

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
            identifier: this.props.defaultToken.Identifier,
            networkId: this.props.defaultToken.NetworkId,
            amount: formattedAmountToBigNumber(amountFieldProps.value).shiftedBy(
              this.props.defaultToken.Metadata.numberOfDecimals
            ),
          },
        ],
        {
          defaultIdentifier: this.props.defaultToken.Identifier,
          defaultNetworkId: this.props.defaultToken.NetworkId,
        }
      );

    const amountInputError = transactionFeeError || amountField.error;
    const [tokens, nfts] = this.getTokensAndNFTs(totalAmount);

    const defaultTokenInfo = this.props.getTokenInfo({
      identifier: this.props.defaultToken.Identifier,
      networkId: this.props.defaultToken.NetworkId,
    });

    const showFiat = this.props.unitOfAccountSetting.enabled && this.props.unitOfAccountSetting.currency;

    const domainResolverResult = this.state.domainResolverResult;
    const domainResolverSupported = this.props.resolveDomainAddress != null;
    switch (step) {
      case SEND_FORM_STEP.RECEIVER:
        return (
          <Box className={styles.receiverStep} sx={{ background: 'ds.bg_color_max' }}>
            {domainResolverSupported && this.props.supportedAddressDomainBannerState.isDisplayed ? (
              <Box pb="10px">
                <SupportedAddressDomainsBanner onClose={this.props.supportedAddressDomainBannerState.onClose} />
              </Box>
            ) : null}
            <Box sx={{ position: 'relative' }}>
              <STextField
                greenCheck={domainResolverResult != null}
                isLoading={this.state.domainResolverIsLoading}
                className="send_form_receiver"
                {...receiverField.bind()}
                error={receiverField.error}
                helperText={domainResolverResult?.nameServer ?? this.state.domainResolverMessage}
                label={
                  domainResolverSupported
                    ? intl.formatMessage(messages.receiverFieldLabelResolverSupported)
                    : intl.formatMessage(messages.receiverFieldLabelDefault)
                }
              />
              {domainResolverResult != null ? (
                <Typography
                  component="div"
                  variant="caption1"
                  align="right"
                  color={invalidMemo ? 'ds.sys_magenta_500' : 'ds.gray_600'}
                  sx={{ position: 'absolute', bottom: '28px', right: '0px' }}
                  id="wallet:send:enterAddressStep-domainResolverAddress-text"
                >
                  {intl.formatMessage(messages.receiverFieldLabelResolvedAddress)}:&nbsp;
                  {truncateAddressShort(domainResolverResult.address)}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ position: 'relative', mt: '8px' }}>
              <SMemoTextField
                onChange={e => this.onUpdateMemo(e.target.value)}
                helperText={
                  invalidMemo
                    ? intl.formatMessage(messages.memoInvalidOptional, { maxMemo: MAX_MEMO_SIZE })
                    : intl.formatMessage(memoMessages.memoWarning)
                }
                error={invalidMemo}
                onFocus={() => {
                  this.setMemoFieldStatus(true);
                }}
                onBlur={() => {
                  if (!memo || memo.length === 0) this.setMemoFieldStatus(false);
                }}
                label={
                  this.state.isMemoFieldActive
                    ? intl.formatMessage(memoMessages.memoLabel)
                    : intl.formatMessage(messages.memoFieldLabelInactive)
                }
                id="wallet:send:enterAddressStep-enterMemo-input"
                sx={{
                  '& .MuiFormHelperText-root': {
                    marginInline: 0,
                    mt: 0.5,
                    fontSize: '0.750rem',
                    lineHeight: '1rem',
                    letterSpacing: '0.2px',
                  },
                }}
                value={this.props.memo}
              />
              <Typography
                component="div"
                variant="caption1"
                align="right"
                color={invalidMemo ? 'ds.sys_magenta_500' : 'ds.gray_600'}
                sx={{ position: 'absolute', bottom: '28px', right: '0px' }}
              >
                {memo ? memo.length : 0}/{MAX_MEMO_SIZE}
              </Typography>
            </Box>
          </Box>
        );
      case SEND_FORM_STEP.AMOUNT:
        return (
          <Box className={styles.amountStep}>
            {isCalculatingFee && (
              <Typography
                component="div"
                variant="caption1"
                sx={{
                  position: 'absolute',
                  color: 'grey.600',
                  left: '50%',
                  top: '-14px',
                  transform: 'translateX(-50%)',
                }}
              >
                {intl.formatMessage(messages.calculatingFee)}
              </Typography>
            )}

            {!isDefaultIncluded && (
              <Typography
                component="div"
                variant="caption1"
                sx={{
                  position: 'absolute',
                  color: 'ds.sys_magenta_500',
                  left: '50%',
                  top: '-14px',
                  transform: 'translateX(-50%)',
                }}
              >
                {transactionFeeError}
              </Typography>
            )}
            <Box
              sx={{
                height: showFiat ? '129px' : '64px',
                position: 'relative',
                padding: '16px 0px',
                borderRadius: '8px',
                ...(amountInputError && isDefaultIncluded
                  ? {
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: 'ds.sys_magenta_500',
                    }
                  : {
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'ds.el_gray_min',
                    }),
              }}
            >
              <Typography
                component="div"
                sx={{
                  position: 'absolute',
                  top: '-8px',
                  left: '6px',
                  backgroundColor: 'ds.bg_color_max',
                  paddingX: '4px',
                  color: 'ds.text_gray_medium',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '16px',
                  letterSpacing: '0.2px',
                }}
                variant="caption2"
              >
                {intl.formatMessage(globalMessages.amountLabel)}
              </Typography>
              <Box
                sx={{
                  height: '32px',
                  margin: '0px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& input': {
                    padding: '0px',
                    '&:disabled': {
                      cursor: 'not-allowed',
                    },
                  },
                }}
              >
                <AmountInputRevamp
                  {...amountFieldProps}
                  value={amountFieldProps.value === '' ? null : formattedAmountToBigNumber(amountFieldProps.value)}
                  className="send_form_amount"
                  label={intl.formatMessage(globalMessages.amountLabel)}
                  decimalPlaces={this.getNumDecimals()}
                  disabled={shouldSendAll}
                  error={amountInputError}
                  helperText=""
                  currency={truncateToken(getTokenName(this.props.defaultToken))}
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
                    if (!amountField.value) this.props.onRemoveTokens([defaultTokenInfo]);
                  }}
                  amountFieldRevamp
                  placeholder="0"
                />

                <Typography component="div" variant="button2" color="ds.text_gray_low" fontWeight={500} mr="12px">
                  {truncateToken(getTokenName(this.props.defaultToken))}
                </Typography>

                <Button
                  variant="tertiary"
                  color="secondary"
                  size="small"
                  sx={{
                    '&.MuiButton-sizeSmall': {
                      padding: '8px 4px',
                      backgroundColor: 'ds.gray_100',
                      color: 'ds.text_gray_low',
                      minWidth: '48px',
                      height: '30px',
                      ':hover': {
                        backgroundColor: 'ds.gray_200',
                      },
                      ':active': {
                        backgroundColor: 'ds.gray_300',
                      },
                    },
                  }}
                  disabled={maxSendableAmount.isExecuting}
                  className={classnames([styles.maxBtn, maxSendableAmount.isExecuting && styles.maxButtonSpinning])}
                  onClick={() => {
                    const hasTokens = spendableBalance && spendableBalance.nonDefaultEntries().length !== 0;
                    if (hasTokens || !spendableBalance) {
                      this.props.calculateMaxAmount();
                      return;
                    }

                    if (shouldSendAll) {
                      amountField.reset();
                      this.props.onRemoveTokens([defaultTokenInfo]);
                    } else {
                      this.props.onAddToken({
                        shouldReset: true,
                      });
                      this.props.updateSendAllStatus(true);
                    }
                  }}
                >
                  {maxSendableAmount.isExecuting ? (
                    <LoadingSpinner small />
                  ) : (
                    <Typography variant="body2" fontWeight={500}>
                      {intl.formatMessage(messages.max)}
                    </Typography>
                  )}
                </Button>
              </Box>
              {showFiat && (
                <Box
                  sx={{
                    margin: '16px 16px 0px 16px',
                    pt: '24px',
                    color: 'ds.text_gray_low',
                    fontSize: '16px',
                    letterSpacing: 0,
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderTopColor: 'ds.gray_200',
                  }}
                >
                  {this.renderUnitOfAccountAmount(amountFieldProps.value)}
                </Box>
              )}
              {isDefaultIncluded && (
                <Typography
                  component="div"
                  sx={{
                    position: 'absolute',
                    bottom: '-25px',
                    left: '17px',
                    color: 'ds.text_error',
                    fontSize: '12px',
                  }}
                  id="wallet:send:addAssetsStep-amountError-text"
                >
                  {amountInputError}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                mt: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <Button
                variant="tertiary"
                color="primary"
                sx={{ marginRight: '16px' }}
                onClick={() => this.props.openDialog(AddTokenDialog)}
                disabled={this.props.shouldSendAll}
                startIcon={<PlusIcon />}
                id="wallet:send:addAssetsStep-addTokens-button"
              >
                {intl.formatMessage(globalMessages.addToken)}
              </Button>
              <Button
                variant="tertiary"
                color="primary"
                onClick={() => this.props.openDialog(AddNFTDialog)}
                disabled={this.props.shouldSendAll}
                startIcon={<PlusIcon />}
                id="wallet:send:addAssetsStep-addNFTs-button"
              >
                {intl.formatMessage(globalMessages.addNft)}
              </Button>
            </Box>

            <IncludedTokens
              tokens={tokens}
              nfts={nfts}
              onRemoveTokens={tokensRemove => {
                const assetCount = totalAmount.nonDefaultEntries().length - 1;
                this.props.onRemoveTokens(tokensRemove);
                ampli.sendSelectAssetUpdated({
                  asset_count: assetCount,
                });
              }}
              shouldSendAll={shouldSendAll}
            />
          </Box>
        );
      default:
        throw Error(`${step} is not a valid step`);
    }
  }

  renderCurrentFooter(step: number): Node {
    const { form } = this;
    const intl = this.context;
    const { invalidMemo } = this.state;
    const { maxSendableAmount } = this.props;

    const receiverField = form.$('receiver');
    const isValidatedValue = receiverField.value === this.state.lastValidatedValue;
    const isValidValue = isValidatedValue && receiverField.isValid;

    switch (step) {
      case SEND_FORM_STEP.RECEIVER:
        return (
          <ActionButton
            key="receiver-next"
            variant="primary"
            size="medium"
            onClick={() => this.onUpdateStep(SEND_FORM_STEP.AMOUNT)}
            disabled={invalidMemo || !isValidValue}
            id="wallet:send:enterAddressStep-nextToAddAssets-button"
          >
            {intl.formatMessage(globalMessages.nextButtonLabel)}
          </ActionButton>
        );
      case SEND_FORM_STEP.AMOUNT:
        return (
          <>
            <ActionButton
              key="amount-back"
              variant="secondary"
              size="medium"
              onClick={() => this.onUpdateStep(SEND_FORM_STEP.RECEIVER)}
              id="wallet:send:addAssetsStep-backToEnterAddress-button"
            >
              {intl.formatMessage(globalMessages.backButtonLabel)}
            </ActionButton>
            <SendTokensButton
              stores={this.props.stores}
              disabled={!this.props.fee || this.props.hasAnyPending || invalidMemo || maxSendableAmount.isExecuting}
              label={intl.formatMessage(globalMessages.nextButtonLabel)}
              onSuccess={() => {
                this.onUpdateStep(SEND_FORM_STEP.RECEIVER);
              }}
              receiverHandler={receiverField.value}
            />
          </>
        );
      default:
        return null;
    }
  }

  render(): Node {
    const { currentStep } = this.state;
    const { bodyRef } = this;
    return (
      <>
        <Box className={styles.component} sx={{ backgroundColor: 'ds.bg_color_max' }}>
          <Box className={styles.wrapper} sx={{ height: '100%' }}>
            <SendFormHeader step={currentStep} onUpdateStep={this.onUpdateStep.bind(this)} />
            <Box
              ref={ref => {
                this.bodyRef = ref;
              }}
              className={styles.formBody}
            >
              {this.renderCurrentStep(currentStep)}
            </Box>
            <Box
              borderTop={bodyRef && bodyRef.scrollHeight > bodyRef.clientHeight ? '1px solid' : '0'}
              borderColor="grayscale.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap="24px"
              p="24px"
              mx="-24px"
              mt="30px"
            >
              {this.renderCurrentFooter(currentStep)}
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  onUpdateStep(step: number): void {
    if (step > 3) throw new Error('Invalid Step number.');
    this.setState({ currentStep: step });
    if (step > this.maxStep) {
      this.maxStep = step;
      if (step === SEND_FORM_STEP.AMOUNT) {
        ampli.sendSelectAssetPageViewed();
      }
    }
  }

  onUpdateMemo(memo: string) {
    const isValid = isValidMemoOptional(memo);
    this.props.updateMemo(memo);
    this.setState({ invalidMemo: !isValid });
  }

  renderUnitOfAccountAmount(value: string): Node {
    let convertedAmount;

    const { currency } = this.props.unitOfAccountSetting;

    if (currency == null) throw new Error('No currency selected');

    let amount;
    try {
      amount = new BigNumber(value);
    } catch {
      amount = null;
    }
    if (!amount || amount.isNaN()) {
      convertedAmount = '0';
    } else {
      const ticker = this.props.defaultToken.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getCurrentPrice(ticker, currency);

      if (price != null) {
        convertedAmount = calculateAndFormatValue(amount, price);
      } else {
        convertedAmount = '0';
      }
    }

    return `${convertedAmount} ${currency}`;
  }
}

const ActionButton: any = styled(Button)(() => ({
  minWidth: '128px',
  '&.MuiButton-sizeMedium': {
    padding: '13px 24px',
  },
}));
