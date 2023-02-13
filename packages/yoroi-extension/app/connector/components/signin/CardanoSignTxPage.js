// @flow
/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { Notification } from '../../../types/notificationType';
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
  TxDataOutput,
  TxDataInput,
} from '../../types';
import { intlShape, defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
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
import { MultiToken } from '../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import CardanoUtxoDetails from './cardano/UtxoDetails';
import { Box } from '@mui/system';
import WalletCard from '../connect/ConnectedWallet';
import SignTxTabs from './SignTxTabs';
import { signTxMessages } from './SignTxPage';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import CardanoSignTx from './cardano/SignTx';
import ConnectionInfo from './cardano/ConnectionInfo';
import CardanoSignTxSummary from './cardano/SignTxSummary';
import TextField from '../../../components/common/TextField';

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
|};

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

const messages = defineMessages({
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  sendError: {
    id: 'connector.signin.error.sendError',
    defaultMessage: '!!!An error occured when sending the transaction.',
  },
});

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
          label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
          placeholder: this.context.intl.formatMessage(
            globalMessages.walletPasswordFieldPlaceholder
          ),
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
                .invalidate(this.context.intl.formatMessage(messages.incorrectWalletPasswordError));
            } else {
              throw error;
            }
          });
      },
      onError: () => {},
    });
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

  getUniqueAssets: (
    Array<TxDataOutput>
  ) => Array<{|
    tokenInfo: ?$ReadOnly<TokenRow>,
    amount: BigNumber,
  |}> = assets => {
    return assets.reduce((acc, curr) => {
      const newAcc: Array<{|
        tokenInfo: ?$ReadOnly<TokenRow>,
        amount: BigNumber,
      |}> = [].concat(acc);

      const defaultEntry = curr.value.getDefaultEntry();

      [defaultEntry].concat(curr.value.nonDefaultEntries()).forEach(e => {
        if (!newAcc.some(a => a.tokenInfo?.Identifier === e.identifier) && e.identifier) {
          const tokenInfo = this.props.getTokenInfo(e);
          tokenInfo && newAcc.push({ tokenInfo, amount: e.amount });
        }
      });

      return newAcc;
    }, []);
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
      const defaultNetworkId = txData.amount.defaults.defaultNetworkId;
      const defaultTokenAmount = txData.amount.get(defaultTokenId) ?? new BigNumber('0');
      const txFeeAmount = new BigNumber(txData.fee.amount);
      const sentAssets = this.getUniqueAssets(txData.outputs.filter(o => !o.isForeign));
      const receivedAssets = this.getUniqueAssets(
        txData.inputs.map(i => ({ ...i, isForeign: false }))
      );

      //only tx fee (no sign) & one asset sent/received
      assetsData.total = this.getDisplayAmount({
        identifier: txData.fee.tokenId,
        networkId: txData.fee.networkId,
        amount: defaultTokenAmount,
        fee: txFeeAmount,
      });

      assetsData.isOnlyTxFee = defaultTokenAmount.toNumber() === 0;

      // More than 1 asset sent/received (rather is NFT or not)
      if (sentAssets.length > 1 || receivedAssets.length > 1) {
        assetsData.sent = sentAssets.filter(Boolean);
        assetsData.received = receivedAssets.filter(Boolean);
      }
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

    const url = connectedWebsite?.url ?? '';
    const faviconUrl = connectedWebsite?.image ?? '';

    let content;
    let utxosContent;
    if (txData) {
      const summaryAssetsData = this.getSummaryAssetsData();

      content = (
        <Box>
          <CardanoSignTx
            txAssetsData={summaryAssetsData}
            passwordFormField={
              <TextField
                type="password"
                {...walletPasswordField.bind()}
                error={walletPasswordField.error}
              />
            }
          />
        </Box>
      );

      utxosContent = (
        <Box>
          <Box mb="32px">
            <CardanoSignTxSummary txAssetsData={summaryAssetsData} />
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
          <Typography color="#4A5065" variant="body1" fontWeight={500} mb="16px">
            {intl.formatMessage(signTxMessages.signMessage)}
          </Typography>
          <Box
            width="100%"
            p="16px"
            border="1px solid var(--yoroi-palette-gray-100)"
            borderRadius="6px"
          >
            <pre>{this.renderPayload(signData.payload)}</pre>
          </Box>
        </Box>
      );
      utxosContent = null;
    } else {
      return null;
    }

    return (
      <Box height="100%" display="flex" flexDirection="column">
        <SignTxTabs
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
            >
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!walletPasswordField.isValid}
              onClick={this.submit.bind(this)}
              sx={{ minWidth: 0 }}
            >
              {intl.formatMessage(globalMessages.confirm)}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default SignTxPage;
