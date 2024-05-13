// @flow
/* eslint-disable no-nested-ternary */
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Notification } from '../../../types/notification.types';
import type {
  DefaultTokenEntry,
  TokenLookupKey,
  TokenEntry,
} from '../../../api/common/lib/MultiToken';
import type { NetworkRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type {
  PublicDeriverCache,
  WhitelistEntry,
} from '../../../../chrome/extension/connector/types';
import type {
  CardanoConnectorSignRequest,
  SignSubmissionErrorType,
} from '../../types';
import type LocalizableError from '../../../i18n/LocalizableError';
import { Component } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import {
  getTokenName,
  getTokenIdentifierIfExists,
  assetNameFromIdentifier,
} from '../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import CardanoUtxoDetails from './cardano/UtxoDetails';
import { Box } from '@mui/system';
import SignTxTabs from './SignTxTabs';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { ReactComponent as ExternalLinkIcon } from '../../assets/images/external-link.inline.svg';
import CardanoSignTx from './cardano/SignTx';
import ConnectionInfo from './cardano/ConnectionInfo';
import CardanoSignTxSummary from './cardano/SignTxSummary';
import TextField from '../../../components/common/TextField';
import ErrorBlock from '../../../components/widgets/ErrorBlock';

const messages = defineMessages({
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  sendError: {
    id: 'connector.signin.error.sendError',
    defaultMessage: '!!!An error occured when sending the transaction.',
  },
  signMessage: {
    id: 'connector.signin.signMessage',
    defaultMessage: '!!!Sign Message',
  },
});

export type SummaryAssetsData = {|
  total: DisplayAmount | Object,
  isOnlyTxFee: boolean,
  sent: Array<any>,
  received: Array<any>,
|};

type TokenEntryWithFee = {|
  ...TokenEntry,
  +fee: BigNumber,
|};

type Props = {|
  +txData: ?CardanoConnectorSignRequest,
  +onCopyAddressTooltip: (string, string) => void,
  +onCancel: () => void,
  +onConfirm: string => Promise<void>,
  +notification: ?Notification,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +defaultToken: DefaultTokenEntry,
  +network: $ReadOnly<NetworkRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +selectedExplorer: SelectedExplorer,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +shouldHideBalance: boolean,
  +selectedWallet: PublicDeriverCache,
  +connectedWebsite: ?WhitelistEntry,
  +submissionError: ?SignSubmissionErrorType,
  +signData: ?{| address: string, payload: string |},
  +walletType: 'ledger' | 'trezor' | 'web',
  +hwWalletError: ?LocalizableError,
  +isHwWalletErrorRecoverable: ?boolean,
  +tx: ?string,
|};

type State = {|
  isSubmitting: boolean,
|};

type DisplayAmount = {|
  fiatAmount: string | null,
  currency: string | null,
  amount: string,
  fee: string,
  total: string,
  ticker: Node | string,
|};

@observer
class SignTxPage extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isSubmitting: false,
  };

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm(
    {
      fields: {
        walletPassword: {
          type: 'password',
          label: this.context.intl.formatMessage(globalMessages.passwordLabel),
          placeholder: this.context.intl.formatMessage(globalMessages.passwordLabel),
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
        validateOnBlur: false,
        validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
      },
      plugins: {
        vjf: vjf(),
      },
    }
  );

  submit(): void {
    if (this.props.walletType === 'web') {
      this.form.submit({
        onSuccess: form => {
          const { walletPassword } = form.values();
          this.setState({ isSubmitting: true });
          this.props
            .onConfirm(walletPassword)
            .finally(() => {
              this.setState({ isSubmitting: false });
            })
            .catch(error => {
              if (error instanceof WrongPassphraseError) {
                this.form
                  .$('walletPassword')
                  .invalidate(
                    this.context.intl.formatMessage(messages.incorrectWalletPasswordError)
                  );
              } else {
                throw error;
              }
            });
        },
        onError: () => {},
      });
    } else {
      this.setState({ isSubmitting: true });
      this.props
        .onConfirm('')
        .finally(() => {
          this.setState({ isSubmitting: false });
        })
        .catch(error => {
          throw error;
        });
    }
  }

  getTicker: ($ReadOnly<TokenRow>) => Node = tokenInfo => {
    const fingerprint = this.getFingerprint(tokenInfo);
    return fingerprint !== undefined ? (
      <ExplorableHashContainer
        selectedExplorer={this.props.selectedExplorer}
        hash={fingerprint}
        light
        linkType="token"
      >
        <span>{truncateToken(getTokenName(tokenInfo))}</span>
      </ExplorableHashContainer>
    ) : (
      truncateToken(getTokenName(tokenInfo))
    );
  };

  renderAddressExplorerUrl: ($ReadOnly<TokenRow>) => Node = tokenInfo => {
    const fingerprint = this.getFingerprint(tokenInfo);
    return fingerprint !== undefined ? (
      <ExplorableHashContainer
        selectedExplorer={this.props.selectedExplorer}
        hash={fingerprint}
        light
        linkType="token"
      >
        <span>{truncateAddressShort(getTokenName(tokenInfo), 10)}</span> <ExternalLinkIcon />
      </ExplorableHashContainer>
    ) : (
      truncateAddressShort(getTokenName(tokenInfo), 10)
    );
  };

  getFingerprint: ($ReadOnly<TokenRow>) => string | void = tokenInfo => {
    if (tokenInfo.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  };

  getDisplayAmount: TokenEntryWithFee => DisplayAmount = request => {
    const tokenInfo = this.props.getTokenInfo(request);
    if (!tokenInfo) {
      throw new Error('missing token info');
    }

    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = request.amount.shiftedBy(-numberOfDecimals);
    const shiftedFee = request.fee.shiftedBy(-numberOfDecimals);
    const onlyFeeOrSend = request.amount.toNumber() === 0 || request.amount.toNumber() < 0;
    const shiftedTotal = request.amount
      .plus(onlyFeeOrSend ? request.fee.negated() : request.fee)
      .shiftedBy(-numberOfDecimals);

    const ticker = tokenInfo
      ? this.getTicker(tokenInfo)
      : assetNameFromIdentifier(request.identifier);

    let fiatAmountDisplay = null;
    let fiatCurrency = null;

    // this is a feature flag
    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(getTokenName(tokenInfo), currency);
      if (price != null) {
        const fiatAmount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = fiatAmount.split('.');
        fiatAmountDisplay = beforeDecimal + (afterDecimal ? '.' + afterDecimal : '.00');
        fiatCurrency = currency;
      }
    }

    const [beforeDecimalAmount, afterDecimalAmount] = splitAmount(shiftedAmount, numberOfDecimals);
    const [beforeDecimalFee, afterDecimalFee] = splitAmount(shiftedFee, numberOfDecimals);
    const [beforeDecimalTotal, afterDecimalTotal] = splitAmount(shiftedTotal, numberOfDecimals);

    return {
      fiatAmount: fiatAmountDisplay,
      currency: fiatCurrency,
      amount: beforeDecimalAmount + (afterDecimalAmount || ''),
      fee: beforeDecimalFee + (afterDecimalFee || ''),
      total: beforeDecimalTotal + (afterDecimalTotal || ''),
      ticker,
    };
  };

  getAssetsExplorerLink: Object = () => {
    return null;
  };

  getSummaryAssetsData: void => SummaryAssetsData = () => {
    const { txData } = this.props;

    const assetsData = {
      total: {},
      isOnlyTxFee: false,
      sent: [],
      received: [],
    };

    if (txData) {
      const defaultTokenId = txData.amount.defaults.defaultIdentifier;
      const defaultTokenAmount = txData.amount.get(defaultTokenId) ?? new BigNumber('0');
      const txFeeAmount = new BigNumber(txData.fee.amount);

      const assets = txData.amount.nonDefaultEntries();
      for (const asset of assets) {
        const assetInfo = {
          amount: asset.amount,
          // todo: properly query the backend (but don't block the UI) instead of using a default
          tokenInfo: this.props.getTokenInfo(asset) ?? {
            Identifier: asset.identifier,
            IsDefault: false,
            Metadata: {
              type: 'Cardano',
              policyId: asset.identifier.split('.')[0],
              assetName: asset.identifier.split('.')[1],
              numberOfDecimals: 0,
              ticker: null,
              longName: null,
            },
          },
        };
        if (asset.amount.isPositive()) {
          assetsData.received.push(assetInfo);
        } else {
          assetsData.sent.push(assetInfo);
        }
      }

      // only tx fee (no sign) & one asset sent/received
      assetsData.total = this.getDisplayAmount({
        identifier: txData.fee.tokenId,
        networkId: txData.fee.networkId,
        amount: defaultTokenAmount,
        fee: txFeeAmount,
      });

      assetsData.isOnlyTxFee = defaultTokenAmount.toNumber() === 0;
    }
    return assetsData;
  };

  renderPayload(payloadHex: string): string {
    const utf8 = Buffer.from(payloadHex, 'hex').toString('utf8');
    if (utf8.match(/^[\P{C}\t\r\n]+$/u)) {
      return utf8;
    }
    return payloadHex;
  }

  render(): Node {
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');

    const { intl } = this.context;
    const { txData, onCancel, connectedWebsite, signData } = this.props;

    const { isSubmitting } = this.state;

    const { walletType, hwWalletError, isHwWalletErrorRecoverable } = this.props;

    if (hwWalletError && isHwWalletErrorRecoverable === false) {
      return (
        <>
          <ErrorBlock error={hwWalletError} />
          {Boolean(this.props.tx) && (
            <Box>
              <Typography component="div">Transaction:</Typography>
              <textarea rows="10" style={{ width: '100%' }} disabled value={this.props.tx} />
            </Box>
          )}
        </>
      );
    }

    let content;
    let utxosContent;
    if (txData) {
      const summaryAssetsData = this.getSummaryAssetsData();

      content = (
        <Box>
          <CardanoSignTx
            txAssetsData={summaryAssetsData}
            renderExplorerHashLink={this.renderAddressExplorerUrl}
            walletType={walletType}
            hwWalletError={hwWalletError}
            passwordFormField={
              <TextField
                type="password"
                {...walletPasswordField.bind()}
                error={walletPasswordField.error}
                id="walletPassword"
              />
            }
            cip95Info={txData.cip95Info}
          />
        </Box>
      );

      utxosContent = (
        <Box>
          <Box mb="32px">
            <CardanoSignTxSummary
              txAssetsData={summaryAssetsData}
              renderExplorerHashLink={this.renderAddressExplorerUrl}
            />
          </Box>
          <CardanoUtxoDetails
            txData={txData}
            onCopyAddressTooltip={this.props.onCopyAddressTooltip}
            addressToDisplayString={this.props.addressToDisplayString}
            getCurrentPrice={this.props.getCurrentPrice}
            getTokenInfo={this.props.getTokenInfo}
            notification={this.props.notification}
            selectedExplorer={this.props.selectedExplorer}
            unitOfAccountSetting={this.props.unitOfAccountSetting}
          />
        </Box>
      );
    } else if (signData) {
      // signing data
      content = (
        <Box>
          <Typography component="div" color="#4A5065" variant="body1" fontWeight={500} mb="16px" id="signMessageTitle">
            {intl.formatMessage(messages.signMessage)}
          </Typography>
          <Box
            width="100%"
            p="16px"
            border="1px solid var(--yoroi-palette-gray-100)"
            borderRadius="6px"
            id="signMessageBox-payload"
            sx={{ overflow: 'auto' }}
          >
            <pre>{this.renderPayload(signData.payload)}</pre>
          </Box>

          <Box mt="16px">
            <TextField
              type="password"
              {...walletPasswordField.bind()}
              error={walletPasswordField.error}
              id="walletPassword"
            />
          </Box>
        </Box>
      );
      utxosContent = null;
    } else {
      return null;
    }

    let confirmButtonLabel;
    if (walletType === 'ledger') {
      confirmButtonLabel = globalMessages.confirmOnLedger;
    } else if (walletType === 'trezor') {
      confirmButtonLabel = globalMessages.confirmOnTrezor;
    } else {
      confirmButtonLabel = globalMessages.confirm;
    }

    return (
      <Box height="100%" display="flex" flexDirection="column">
        <SignTxTabs
          isDataSignin={!txData && Boolean(signData)}
          detailsContent={<Box overflowWrap="break-word">{content}</Box>}
          connectionContent={
            <ConnectionInfo
              connectedWallet={this.props.selectedWallet}
              connectedWebsite={connectedWebsite}
            />
          }
          utxosContent={utxosContent}
        />
        <Box
          sx={{
            padding: '32px',
            borderTop: '1px solid #DCE0E9',
            maxWidth: '100%',
            backgroundColor: '#fff',
          }}
        >
          <Box sx={{ display: 'flex', gap: '15px' }}>
            <Button
              sx={{ minWidth: 0 }}
              fullWidth
              variant="outlined"
              color="primary"
              onClick={onCancel}
              disabled={isSubmitting}
              id="cancelButton"
            >
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={(walletType === 'web' && !walletPasswordField.isValid) || isSubmitting}
              onClick={this.submit.bind(this)}
              sx={{ minWidth: 0 }}
              id="confirmButton"
            >
              {intl.formatMessage(confirmButtonLabel)}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default SignTxPage;
