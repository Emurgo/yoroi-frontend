/* eslint-disable no-nested-ternary */
// @flow
// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button, Typography } from '@mui/material';
import TextField from '../../../components/common/TextField';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
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
import { getTokenName, getTokenIdentifierIfExists } from '../../../stores/stateless/tokenHelpers';
import type { ISignRequest } from '../../../api/common/lib/transactions/ISignRequest';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { mintedTokenInfo } from '../../../../chrome/extension/connector/utils';
import type { PublicDeriverCache, Tx, WhitelistEntry } from '../../../../chrome/extension/connector/types';
import { Logger } from '../../../utils/logging';
import UtxoDetails from './UtxoDetails';
import SignTxTabs from './SignTxTabs';
import { Box } from '@mui/system';
import WalletCard from '../connect/ConnectedWallet';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { LoadingButton } from '@mui/lab';
import { ReactComponent as NoDappIcon } from '../../../assets/images/dapp-connector/no-dapp.inline.svg';

type Props = {|
  +tx: Tx,
  +txData: ISignRequest<any>,
  +onCopyAddressTooltip: (string, string) => void,
  +onCancel: () => void,
  +onConfirm: string => Promise<void>,
  +notification: ?Notification,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +defaultToken: DefaultTokenEntry,
  +network: $ReadOnly<NetworkRow>,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +addressToDisplayString: string => string,
  +selectedExplorer: SelectedExplorer,
  +getCurrentPrice: (from: string, to: string) => ?string,
  +shouldHideBalance: boolean,
  +selectedWallet: PublicDeriverCache,
  +connectedWebsite: ?WhitelistEntry,
|};

export const signTxMessages: Object = defineMessages({
  title: {
    id: 'connector.signin.title',
    defaultMessage: '!!!Sign transaction',
  },
  summary: {
    id: 'connector.signin.summary',
    defaultMessage: '!!!Summary',
  },
  txDetails: {
    id: 'connector.signin.txDetails',
    defaultMessage: '!!!Transaction Details',
  },
  totals: {
    id: 'connector.signin.totals',
    defaultMessage: '!!!Totals',
  },
  connectedTo: {
    id: 'connector.signin.connectedTo',
    defaultMessage: '!!!Connected To',
  },
  transactionFee: {
    id: 'connector.signin.transactionFee',
    defaultMessage: '!!!Transaction Fee',
  },
  totalAmount: {
    id: 'connector.signin.totalAmount',
    defaultMessage: '!!!Total Amount',
  },
  receiver: {
    id: 'connector.signin.receiver',
    defaultMessage: '!!!Receiver',
  },
  more: {
    id: 'connector.signin.more',
    defaultMessage: '!!!more',
  },
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  signMessage: {
    id: 'connector.signin.signMessage',
    defaultMessage: '!!!Sign Message',
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
        this.props.onConfirm(walletPassword).catch(error => {
          if (error instanceof WrongPassphraseError) {
            this.form
              .$('walletPassword')
              .invalidate(
                this.context.intl.formatMessage(signTxMessages.incorrectWalletPasswordError)
              );
          } else {
            throw error;
          }
          this.setState({ isSubmitting: false });
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

  // Tokens can be minted inside the transaction so we have to look it up there first
  _resolveTokenInfo: TokenEntry => $ReadOnly<TokenRow> | null = tokenEntry => {
    const { tx } = this.props;
    const mintedTokens = mintedTokenInfo(tx, Logger.info);
    const mintedToken = mintedTokens.find(t => tokenEntry.identifier === t.Identifier);
    if (mintedToken != null) {
      return mintedToken;
    }

    return this.props.getTokenInfo(tokenEntry);
  };

  displayUnAvailableToken: TokenEntry => Node = tokenEntry => {
    return (
      <>
        <span>+{tokenEntry.amount.toString()}</span>{' '}
        <span>{truncateAddressShort(tokenEntry.identifier)}</span>
      </>
    );
  };

  renderAmountDisplay: ({|
    entry: TokenEntry,
  |}) => Node = request => {
    const tokenInfo = this._resolveTokenInfo(request.entry);

    if (tokenInfo == null) return this.displayUnAvailableToken(request.entry);
    const shiftedAmount = request.entry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    if (false && this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(request.entry.identifier, currency);
      if (price != null) {
        return (
          <>
            <span>{calculateAndFormatValue(shiftedAmount, price)}</span> {currency}
            <div>
              {shiftedAmount.toString()} {this.getTicker(tokenInfo)}
            </div>
          </>
        );
      }
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      tokenInfo.Metadata.numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards.slice(1)
      : '+' + beforeDecimalRewards;

    return (
      <>
        <span>
          {adjustedBefore}
          {afterDecimalRewards}
        </span>{' '}
        {this.getTicker(tokenInfo)}
      </>
    );
  };

  render(): Node {
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');
    const { isSubmitting } = this.state;
    const { intl } = this.context;
    const { txData, onCancel, connectedWebsite } = this.props;

    const totalInput = txData.totalInput();
    const fee = txData.fee();
    const amount = totalInput.joinSubtractCopy(fee);
    const url = connectedWebsite?.url ?? '';
    const faviconUrl = connectedWebsite?.image ?? '';

    return (
      <SignTxTabs
        connectionContent={
          <Box paddingTop="8px" overflowWrap="break-word">
            <Box pt="32px">
              <Typography color="var(--yoroi-palette-gray-900)" variant="h5" marginBottom="8px">
                {intl.formatMessage(signTxMessages.totals)}
              </Typography>
              <Box
                width="100%"
                px="12px"
                py="20px"
                pb="12px"
                border="1px solid var(--yoroi-palette-gray-100)"
                borderRadius="6px"
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  color="var(--yoroi-palette-gray-600)"
                  py="6px"
                  px="10px"
                >
                  <Typography>{intl.formatMessage(signTxMessages.transactionFee)}</Typography>
                  <Typography>
                    {this.renderAmountDisplay({
                      entry: {
                        ...txData.fee().getDefaultEntry(),
                        amount: txData.fee().getDefaultEntry().amount.abs().negated(),
                      },
                    })}
                  </Typography>
                </Box>
                <Box
                  px="12px"
                  py="23px"
                  mt="10px"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  borderRadius="6px"
                  backgroundColor="var(--yoroi-palette-primary-300)"
                  color="var(--yoroi-palette-common-white)"
                >
                  <Typography>{intl.formatMessage(signTxMessages.totalAmount)}</Typography>
                  <Typography variant="h3">
                    {this.renderAmountDisplay({
                      entry: {
                        ...amount.getDefaultEntry(),
                        amount: amount.getDefaultEntry().amount.abs().negated(),
                      },
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box mt="46px">
              <TextField
                type="password"
                {...walletPasswordField.bind()}
                error={walletPasswordField.error}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gridGap: '15px',
                }}
              >
                <Button sx={{ minWidth: 'auto' }} fullWidth variant="secondary" onClick={onCancel}>
                  {intl.formatMessage(globalMessages.cancel)}
                </Button>
                <LoadingButton
                  variant="primary"
                  fullWidth
                  disabled={!walletPasswordField.isValid}
                  onClick={this.submit.bind(this)}
                  loading={isSubmitting}
                >
                  {intl.formatMessage(globalMessages.confirm)}
                </LoadingButton>
              </Box>
            </Box>
          </Box>
        }
        detailsContent={null}
        utxosContent={
          <Box>
            <UtxoDetails
              txData={txData}
              onCopyAddressTooltip={this.props.onCopyAddressTooltip}
              addressToDisplayString={this.props.addressToDisplayString}
              getCurrentPrice={this.props.getCurrentPrice}
              getTokenInfo={this.props.getTokenInfo}
              notification={this.props.notification}
              selectedExplorer={this.props.selectedExplorer}
              tx={this.props.tx}
              unitOfAccountSetting={this.props.unitOfAccountSetting}
            />
          </Box>
        }
      />
    );
  }
}

export default SignTxPage;
