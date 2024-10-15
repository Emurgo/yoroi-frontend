// @flow

/* eslint react/jsx-one-expression-per-line: 0 */ // the &nbsp; in the html breaks this

import type { Node } from 'react';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import type { $npm$ReactIntl$IntlFormat, $npm$ReactIntl$MessageDescriptor } from 'react-intl';
import type { TokenLookupKey, TokenEntry } from '../../../../api/common/lib/MultiToken';
import type { TokenRow, NetworkRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import type LocalizableError from '../../../../i18n/LocalizableError';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import { truncateToken } from '../../../../utils/formatters';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import { getTokenName, genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';
import { Button, Link, Stack, Tooltip, Typography, styled } from '@mui/material';
import { getNFTs, getTokens } from '../../../../utils/wallet';
import { IncorrectWalletPasswordError } from '../../../../api/common/errors';
import { isCardanoHaskell } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import { Box } from '@mui/system';
import { ReactComponent as InfoIcon } from '../../../../assets/images/attention-big-light.inline.svg';
import React, { Component } from 'react';
import TextField from '../../../common/TextField';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../../i18n/global-messages';
import styles from './WalletSendPreviewStep.scss';
import config from '../../../../config';
import WarningBox from '../../../widgets/WarningBox';
import AssetsDropdown from './AssetsDropdown';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import { SEND_FORM_STEP } from '../../../../types/WalletSendTypes';
import { ReactComponent as AttentionIcon } from '../../../../assets/images/attention-modern.inline.svg';

const SBox = styled(Box)(({ theme }) => ({
  backgroundImage: theme.palette.ds.bg_gradient_3,
  color: 'ds.gray_min',
}));

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +amount: MultiToken,
  +receivers: Array<string>,
  +receiverHandle: ?{|
    nameServer: string,
    handle: string,
  |},
  +totalAmount: MultiToken,
  +transactionFee: MultiToken,
  +transactionSize: ?string,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +addressToDisplayString: string => string,
  +isSubmitting: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +isDefaultIncluded: boolean,
  +minAda: ?MultiToken,
  +plannedTxInfoMap: Array<{|
    token: $ReadOnly<TokenRow>,
    amount?: string,
    shouldSendAll?: boolean,
  |}>,
  +selectedNetwork: $ReadOnly<NetworkRow>,
  +walletType: 'trezor' | 'ledger' | 'mnemonic',
  +ledgerSendError: ?LocalizableError,
  +trezorSendError: ?LocalizableError,
  +onUpdateStep: (step: number) => void,
|};

type State = {|
  passwordError: string | null,
  txError: string | null,
|};

const messages = defineMessages({
  receiverHandleLabel: {
    id: 'wallet.send.form.preview.receiverHandleLabel',
    defaultMessage: '!!!Receiver',
  },
  receiverLabel: {
    id: 'wallet.send.form.preview.receiverLabel',
    defaultMessage: '!!!Receiver wallet address',
  },
  nAssets: {
    id: 'wallet.send.form.preview.nAssets',
    defaultMessage: '!!!{number} Assets',
  },
  minAdaHelp: {
    id: 'wallet.send.form.preview.minAdaHelp',
    defaultMessage: '!!!Minimum ADA required to send these assets. {moreDetails}',
  },
  moreDetails: {
    id: 'wallet.send.form.preview.moreDetails',
    defaultMessage: '!!!More details here',
  },
  txConfirmationLedgerNanoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  sendUsingLedgerNano: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
  txConfirmationTrezorTLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  sendUsingTrezorT: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});

@observer
export default class WalletSendPreviewStep extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    passwordError: null,
    txError: null,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: '',
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

  submit(): void {
    if (this.props.walletType === 'mnemonic') {
      this.form.submit({
        onSuccess: async form => {
          const { walletPassword } = form.values();
          const transactionData = {
            password: walletPassword,
          };
          try {
            await this.props.onSubmit(transactionData);
          } catch (error) {
            const errorMessage = this.context.intl.formatMessage(error, error.values);
            if (error instanceof IncorrectWalletPasswordError) {
              this.setState({ passwordError: errorMessage });
            } else {
              this.setState({ txError: errorMessage });
            }
          }
        },
        onError: () => {},
      });
    } else {
      // hw wallets are not using passwords
      this.props.onSubmit({ password: '' });
    }
  }

  convertedToUnitOfAccount: (TokenEntry, string) => string = (token, toCurrency) => {
    const tokenInfo = this.props.getTokenInfo(token);

    const shiftedAmount = token.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    const ticker = tokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const coinPrice = this.props.getCurrentPrice(ticker, toCurrency);

    if (coinPrice == null) return '-';

    return calculateAndFormatValue(shiftedAmount, coinPrice);
  };

  renderDefaultTokenAmount: TokenEntry => Node = entry => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    return (
      <div className={styles.amount} id="wallet:send:confrimTransactionStep-amountToSend-text">
        {formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{truncateToken(getTokenName(this.props.getTokenInfo(entry)))}</span>
      </div>
    );
  };

  renderTotalAmount: TokenEntry => Node = entry => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    const { unitOfAccountSetting } = this.props;
    return unitOfAccountSetting.enabled ? (
      <Stack direction="column" alignItems="flex-end">
        <Stack direction="row" id="wallet:send:confrimTransactionStep-totalAmount-text">
          <Typography variant="h4" color="ds.white_static" fontWeight={500} fontSize="20px">
            {formatValue(entry)}
          </Typography>
          <Typography variant="h4" color="ds.white_static" fontWeight={500} fontSize="20px">
            &nbsp;{truncateToken(getTokenName(this.props.getTokenInfo(entry)))}
          </Typography>
        </Stack>
        <Stack direction="row" id="wallet:send:confrimTransactionStep-totalAmountInFiat-text">
          <Typography variant="body1" color="ds.white_static" sx={{ opacity: '0.5' }}>
            {this.convertedToUnitOfAccount(entry, unitOfAccountSetting.currency)}
          </Typography>
          <Typography variant="body1" color="ds.white_static" sx={{ opacity: '0.5' }}>
            &nbsp;{unitOfAccountSetting.currency}
          </Typography>
        </Stack>
      </Stack>
    ) : (
      <Stack direction="row" id="wallet:send:confrimTransactionStep-totalAmount-text">
        <Typography variant="h4" color="ds.white_static" fontWeight={500} fontSize="20px">
          {formatValue(entry)}
        </Typography>
        <Typography variant="h4" color="ds.white_static" fontWeight={500} fontSize="20px">
          &nbsp;{truncateToken(getTokenName(this.props.getTokenInfo(entry)))}
        </Typography>
      </Stack>
    );
  };
  renderSingleFee: TokenEntry => Node = entry => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    return (
      <div className={styles.fees} id="wallet:send:confrimTransactionStep-feeAmount-text">
        {formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{truncateToken(getTokenName(this.props.getTokenInfo(entry)))}</span>
      </div>
    );
  };

  renderBundle: ({|
    amount: MultiToken,
    render: TokenEntry => Node,
  |}) => Node = request => {
    return (
      <>
        {request.render(request.amount.getDefaultEntry())}
        {request.amount.nonDefaultEntries().map(entry => (
          <React.Fragment key={entry.identifier}>{request.render(entry)}</React.Fragment>
        ))}
      </>
    );
  };

  _amountLabel: void => Node = () => {
    const { selectedNetwork, plannedTxInfoMap, minAda } = this.props;
    const { intl } = this.context;
    const isCardano = isCardanoHaskell(selectedNetwork);

    if (isCardano) {
      const tokenInfo = plannedTxInfoMap.find(({ token }) => token.IsDefault);
      if (
        (!tokenInfo || // Show Min-Ada label if the ADA is not included
          // Or if included ADA less than Min-ADA
          minAda?.getDefaultEntry().amount.gt(tokenInfo.amount ?? 0)) &&
        !tokenInfo?.shouldSendAll
      ) {
        const moreDetailsLink = (
          <Link
            href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/5008187102351-What-is-the-locked-assets-deposit-"
            target="_blank"
            rel="noreferrer noopener"
            sx={{
              color: 'inherit',
              textDecoration: 'underline',
            }}
          >
            {intl.formatMessage(messages.moreDetails)}
          </Link>
        );
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {intl.formatMessage(globalMessages.minAda)}

            <Tooltip
              placement="top"
              title={
                <Typography component="div" textAlign="center">
                  <FormattedMessage {...messages.minAdaHelp} values={{ moreDetails: moreDetailsLink }} />
                </Typography>
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '10px',
                  '& > svg': {
                    width: 20,
                    height: 20,
                  },
                }}
              >
                <InfoIcon />
              </Box>
            </Tooltip>
          </Box>
        );
      }
    }

    return <Box>{intl.formatMessage(globalMessages.amountLabel)}</Box>;
  };

  renderHWWalletInfo(): Node {
    const { intl } = this.context;
    const { walletType } = this.props;
    if (walletType === 'mnemonic') {
      return null;
    }

    let infoLine1;
    let infoLine2;
    if (walletType === 'trezor') {
      infoLine1 = messages.txConfirmationTrezorTLine1;
      infoLine2 = globalMessages.txConfirmationTrezorTLine2;
    }
    if (walletType === 'ledger') {
      infoLine1 = messages.txConfirmationLedgerNanoLine1;
      infoLine2 = globalMessages.txConfirmationLedgerNanoLine2;
    }
    return (
      <div className={styles.infoBlock}>
        <ul>
          <li key="1">
            <span>{intl.formatMessage(infoLine1)}</span>
            <br />
          </li>
          <li key="2">
            <span>{intl.formatMessage(infoLine2)}</span>
            <br />
          </li>
        </ul>
      </div>
    );
  }

  getSendButtonText(): $npm$ReactIntl$MessageDescriptor {
    const { walletType } = this.props;
    if (walletType === 'ledger') {
      return messages.sendUsingLedgerNano;
    }
    if (walletType === 'trezor') {
      return messages.sendUsingTrezorT;
    }
    return globalMessages.confirm;
  }

  renderErrorBanner: (string, Node) => Node = (errorTitle, descriptionNode) => {
    return (
      <Stack direction="column" gap="8px" className={styles.txError} sx={{ backgroundColor: 'ds.sys_magenta_100' }}>
        <Stack gap="8px" direction="row">
          <AttentionIcon />
          <Typography variant="body1" color="ds.sys_magenta_500">
            {errorTitle}
          </Typography>
        </Stack>
        <Typography variant="body1" color="ds.text-gray-medium">
          {descriptionNode}
        </Typography>
      </Stack>
    );
  };

  renderError(): Node {
    const { walletType } = this.props;
    const { intl } = this.context;
    if (walletType === 'mnemonic') {
      const { txError } = this.state;
      if (txError !== null) {
        return this.renderErrorBanner(
          'Transaction error',
          <div>
            The transaction cannot be done due to technical reasons. Try again or
            <Link
              className={styles.faq}
              href="https://emurgohelpdesk.zendesk.com/hc/en-us/categories/4412619927695-Yoroi"
              target="_blank"
              rel="noreferrer"
              sx={{
                color: 'ds.text-primary-medium',
                marginLeft: '4px',
              }}
            >
              Ask our support team
            </Link>
          </div>
        );
      }
      return null;
    }
    if (walletType === 'trezor') {
      const { trezorSendError } = this.props;
      if (trezorSendError !== null) {
        return this.renderErrorBanner('Transaction error', intl.formatMessage(trezorSendError));
      }
      return null;
    }
    if (walletType === 'ledger') {
      const { ledgerSendError } = this.props;
      if (ledgerSendError !== null) {
        return this.renderErrorBanner('Transaction error', intl.formatMessage(ledgerSendError));
      }
      return null;
    }
    throw new Error('unexpected wallet type');
  }

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const walletPasswordField = form.$('walletPassword');
    const { amount, receivers, isSubmitting, walletType } = this.props;
    const { passwordError } = this.state;

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}
          <br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    const { receiverHandle } = this.props;

    return (
      <div className={styles.component}>
        <Box
          sx={{
            width: '100%',
            overflowY: 'scroll',
          }}
        >
          <Box width="506px" mx="auto">
            {this.renderError()}
            {this.props.staleTx ? <div className={styles.staleTxWarning}>{staleTxWarning}</div> : null}
            {receiverHandle ? (
              <div style={{ marginBottom: '20px' }}>
                <Box mb="8px">
                  <Typography component="div" variant="body1" color="ds.text_gray_medium">
                    {intl.formatMessage(messages.receiverHandleLabel)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    component="div"
                    variant="body1"
                    sx={{
                      color: 'grayscale.900',
                      overflowWrap: 'break-word',
                    }}
                    id="wallet:send:confrimTransactionStep-receiverHandleInfo-text"
                  >
                    {receiverHandle.nameServer}: {receiverHandle.handle}
                  </Typography>
                </Box>
              </div>
            ) : null}
            <div>
              <Box mb="8px">
                <Typography component="div" variant="body1" color="ds.text_gray_low">
                  {intl.formatMessage(messages.receiverLabel)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  component="div"
                  variant="body1"
                  sx={{
                    color: 'ds.text_gray_medium',
                    overflowWrap: 'break-word',
                  }}
                  id="wallet:send:confrimTransactionStep-receiverAddress-text"
                >
                  {this.props.addressToDisplayString(receivers[0])}
                </Typography>
              </Box>
            </div>

            <SBox className={styles.totalAmountWrapper}>
              <Typography variant="body1" color="ds.white_static" fontWeight={400}>
                {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
              </Typography>
              <div>
                <Box className={styles.totalAmountValue} mb="12px">
                  {/* <Typography variant="body2" color="ds.text_gray_medium"> */}
                  {this.renderTotalAmount(this.props.totalAmount.getDefaultEntry())}
                  {/* </Typography> */}
                </Box>
                {amount.nonDefaultEntries().length > 0 && (
                  <Typography variant="h4" color="ds.white_static" fontWeight={500} fontSize="20px" textAlign="right">
                    {intl.formatMessage(messages.nAssets, {
                      number: amount.nonDefaultEntries().length,
                    })}
                  </Typography>
                )}
              </div>
            </SBox>

            <div className={styles.feesWrapper}>
              <Typography variant="body1" color="ds.text_gray_low">
                {intl.formatMessage(globalMessages.transactionFee)}
              </Typography>
              <Typography variant="body1" color="ds.text_gray_medium">
                {this.renderBundle({
                  amount: this.props.transactionFee,
                  render: this.renderSingleFee,
                })}
              </Typography>
            </div>

            <div className={styles.amountWrapper}>
              <Typography variant="body1" color="ds.text_gray_low">
                {this._amountLabel()}
              </Typography>
              <Typography variant="body1" color="ds.text_gray_medium">
                {this.renderDefaultTokenAmount(amount.getDefaultEntry())}
              </Typography>
            </div>

            <div className={styles.wrapper}>
              {this.props.transactionSize != null ? (
                <div className={styles.addressToLabelWrapper}>
                  <Box className={styles.addressToLabel} sx={{ color: 'grayscale.600' }}>
                    {intl.formatMessage(globalMessages.walletSendConfirmationTxSizeLabel)}
                  </Box>
                  <span className={styles.txSize}>{this.props.transactionSize}</span>
                </div>
              ) : null}

              <Box>
                {amount.nonDefaultEntries().length > 0 && (
                  <AssetsDropdown
                    tokens={getTokens(amount, this.props.getTokenInfo)}
                    nfts={getNFTs(amount, this.props.getTokenInfo)}
                  />
                )}
              </Box>

              {walletType === 'mnemonic' && (
                <TextField
                  type="password"
                  {...walletPasswordField.bind()}
                  disabled={isSubmitting}
                  onChange={e => {
                    this.setState({ passwordError: null });
                    walletPasswordField.set('value', e.target.value);
                  }}
                  error={walletPasswordField.error || passwordError}
                  sx={{ mt: '24px' }}
                />
              )}
            </div>

            <div>{this.renderHWWalletInfo()}</div>
          </Box>
        </Box>

        <Box mt="auto" width="100%">
          <Stack gap="24px" alignItems="center" justifyContent="center" direction="row" mt="24px">
            <Button
              key="amount-back"
              variant="secondary"
              size="medium"
              onClick={() => this.props.onUpdateStep(SEND_FORM_STEP.AMOUNT)}
              sx={{ width: '128px' }}
              id="wallet:send:confrimTransactionStep-backToAddAssetsStep-button"
            >
              {intl.formatMessage(globalMessages.backButtonLabel)}
            </Button>
            <Button
              key="amount-next"
              variant="primary"
              size="medium"
              sx={{ width: '128px' }}
              onClick={this.submit.bind(this)}
              disabled={(walletType === 'mnemonic' && !walletPasswordField.isValid) || isSubmitting}
              id="wallet:send:confrimTransactionStep-confirmTransaction-button"
            >
              {isSubmitting ? <LoadingSpinner small light /> : intl.formatMessage(this.getSendButtonText())}
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }
}
