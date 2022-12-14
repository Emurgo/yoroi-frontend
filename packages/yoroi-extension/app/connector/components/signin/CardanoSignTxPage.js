/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button, Typography } from '@mui/material';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import CopyableAddress from '../../../components/widgets/CopyableAddress';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import type { Notification } from '../../../types/notificationType';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import type {
  DefaultTokenEntry,
  TokenLookupKey,
  TokenEntry,
} from '../../../api/common/lib/MultiToken';
import type { NetworkRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  getTokenName,
  getTokenIdentifierIfExists,
  assetNameFromIdentifier,
} from '../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import type {
  PublicDeriverCache,
  WhitelistEntry,
} from '../../../../chrome/extension/connector/types';
import type { CardanoConnectorSignRequest, SignSubmissionErrorType } from '../../types';
import CardanoUtxoDetails from './cardano/UtxoDetails';
import { Box } from '@mui/system';
import WalletCard from '../connect/ConnectedWallet';
import SignTxTabs from './SignTxTabs';
import { signTxMessages } from './SignTxPage';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { LoadingButton } from '@mui/lab';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';
import CardanoSignTxComponent from './cardano/SignTxComponent';
import ConnectionInfoComponent from './cardano/ConnectionInfoComponent';
import CardanoSignTxSummaryComponent from './cardano/SignTxSummaryComponent';
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

  _resolveTokenInfo: TokenEntry => ?$ReadOnly<TokenRow> = tokenEntry => {
    return this.props.getTokenInfo(tokenEntry);
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

  renderAmountDisplay: ({|
    entry: TokenEntry,
  |}) => Node = request => {
    const tokenInfo = this._resolveTokenInfo(request.entry);
    if (!tokenInfo) {
      throw new Error('missing token info');
    }

    const numberOfDecimals = tokenInfo ? tokenInfo.Metadata.numberOfDecimals : 0;
    const shiftedAmount = request.entry.amount.shiftedBy(-numberOfDecimals);
    const ticker = tokenInfo
      ? this.getTicker(tokenInfo)
      : assetNameFromIdentifier(request.entry.identifier);

    let fiatAmountDisplay = null;

    // this is a feature flag
    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(getTokenName(tokenInfo), currency);
      if (price != null) {
        const fiatAmount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = fiatAmount.split('.');
        let beforeDecimalSigned;
        if (beforeDecimal.startsWith('-')) {
          beforeDecimalSigned = beforeDecimal;
        } else {
          beforeDecimalSigned = '+' + beforeDecimal;
        }
        fiatAmountDisplay = (
          <>
            <span>{beforeDecimalSigned}</span>
            {afterDecimal && <span>.{afterDecimal}</span>} {currency}
          </>
        );
      }
    }

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      numberOfDecimals
    );

    const fixedTwoDecimals =
      Number((Number(afterDecimalRewards) / 10 ** afterDecimalRewards.length).toFixed(2)) * 100;

    // we may need to explicitly add + for positive values
    // const adjustedBefore = beforeDecimalRewards.startsWith('-')
    //   ? beforeDecimalRewards
    //   : '+' + beforeDecimalRewards;

    const cryptoAmountDisplay = (
      <>
        <span>{beforeDecimalRewards.replace('-', '')}</span>
        <span>{fixedTwoDecimals}</span> {ticker}
      </>
    );

    if (fiatAmountDisplay) {
      return (
        <>
          <div>{fiatAmountDisplay}</div>
          <div>{cryptoAmountDisplay}</div>
        </>
      );
    }

    return <div>{cryptoAmountDisplay}</div>;
  };

  renderRow: ({|
    kind: string,
    address: {|
      address: string,
      value: MultiToken,
    |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |}) => Node = request => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-copyNotification`;
    const divKey = identifier =>
      `${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = entry => {
      return (
        <div>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform ? request.transform(entry.amount) : entry.amount,
            },
          })}
        </div>
      );
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div key={divKey(request.address.value.getDefaultEntry().identifier)}>
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={() =>
            this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <Typography
              as="span"
              variant="body2"
              color="var(--yoroi-palette-gray-600)"
              sx={{ marginBottom: '8px', marginTop: '4px' }}
            >
              {truncateAddressShort(this.props.addressToDisplayString(request.address.address))}
            </Typography>
          </ExplorableHashContainer>
        </CopyableAddress>
        {renderAmount(request.address.value.getDefaultEntry())}
        {request.address.value.nonDefaultEntries().map(entry => (
          <React.Fragment key={divKey(entry.identifier)}>
            <div />
            <div />
            {renderAmount(entry)}
          </React.Fragment>
        ))}
      </div>
    );
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
      // signing a tx
      const txAmountDefaultToken = txData.amount.defaults.defaultIdentifier;
      const txAmount = txData.amount.get(txAmountDefaultToken) ?? new BigNumber('0');
      const txFeeAmount = new BigNumber(txData.fee.amount).negated();
      const txTotalAmount = txAmount.plus(txFeeAmount);
      const txFeeAmountRender = this.renderAmountDisplay({
        entry: {
          identifier: txData.fee.tokenId,
          networkId: txData.fee.networkId,
          amount: txFeeAmount,
        },
      });
      const txTotalAmountRender = this.renderAmountDisplay({
        entry: {
          identifier: txAmountDefaultToken,
          networkId: txData.amount.defaults.defaultNetworkId,
          amount: txTotalAmount,
        },
      });

      content = (
        <Box>
          <CardanoSignTxComponent
            intl={intl}
            isOnlyTxFee={txAmount.toNumber() === 0}
            txFeeAmount={txFeeAmountRender}
            txTotalAmount={txTotalAmountRender}
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
            <CardanoSignTxSummaryComponent txTotalAmount={txTotalAmountRender} intl={intl} />
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
            <ConnectionInfoComponent
              connectedWallet={this.props.selectedWallet}
              intl={intl}
              connectedWebsite={connectedWebsite}
            />
          }
          utxosContent={utxosContent}
        />
        <Box p="32px" sx={{ borderTop: '1px solid #DCE0E9', maxWidth: '100%' }}>
          <Box sx={{ display: 'flex', gap: '15px' }}>
            <Button sx={{ minWidth: 0 }} fullWidth variant="primary" onClick={onCancel}>
              {intl.formatMessage(globalMessages.cancel)}
            </Button>
            <LoadingButton
              variant="primary"
              fullWidth
              disabled={!walletPasswordField.isValid}
              onClick={this.submit.bind(this)}
              loading={isSubmitting}
              sx={{ minWidth: 0 }}
            >
              {intl.formatMessage(globalMessages.confirm)}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default SignTxPage;
