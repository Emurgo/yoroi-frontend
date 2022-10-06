/* eslint-disable no-nested-ternary */
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button, Typography, Alert, Link } from '@mui/material';
import TextField from '../../../components/common/TextField';
import globalMessages from '../../../i18n/global-messages';
import { observer } from 'mobx-react';
import config from '../../../config';
import vjf from 'mobx-react-form/lib/validators/VJF';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import type { TokenLookupKey, TokenEntry } from '../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  getTokenName,
  getTokenIdentifierIfExists,
  assetNameFromIdentifier,
} from '../../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type { CardanoConnectorSignRequest, SignSubmissionErrorType } from '../../types';
import { Box } from '@mui/system';
import { signTxMessages } from './SignTxPage';
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { LoadingButton } from '@mui/lab';
import { ReactComponent as AddCollateralIcon } from '../../../assets/images/dapp-connector/add-collateral.inline.svg';

type Props = {|
  +txData: ?CardanoConnectorSignRequest,
  +onCancel: () => void,
  +onConfirm: string => Promise<void>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +selectedExplorer: SelectedExplorer,
  +submissionError: ?SignSubmissionErrorType,
|};

const messages = defineMessages({
  incorrectWalletPasswordError: {
    id: 'api.errors.IncorrectPasswordError',
    defaultMessage: '!!!Incorrect wallet password.',
  },
  reorgTitle: {
    id: 'connector.signin.reorg.title',
    defaultMessage: '!!!Add Collateral',
  },
  reorgMessage: {
    id: 'connector.signin.reorg.message',
    defaultMessage:
      '!!!To interact with {smartContractsLink} in Cardano you should add collateral, which means to make a 0 ADA transaction.{lineBreak}{lineBreak}It is a guarantee that prevent from failing smart contracts and scams. {learnMoreLink} about collateral.',
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
class AddCollateralPage extends Component<Props, State> {
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

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards.replace('-', '')
      : beforeDecimalRewards;

    return (
      <div>
        <span>{adjustedBefore}</span>
        <span>{afterDecimalRewards}</span> {ticker}
      </div>
    );
  };

  render(): Node {
    const { txData, onCancel, submissionError } = this.props;
    if (!txData) return null;

    const { intl } = this.context;
    const { form } = this;
    const walletPasswordField = form.$('walletPassword');
    const { isSubmitting } = this.state;

    const txAmountDefaultToken = txData.amount.defaults.defaultIdentifier;
    const txAmount = txData.amount.get(txAmountDefaultToken) ?? new BigNumber('0');
    const txFeeAmount = new BigNumber(txData.fee.amount).negated();

    const learnMoreLink = (
      <Link
        href="https://docs.cardano.org/plutus/collateral-mechanism"
        target="_blank"
        rel="noreferrer"
        sx={{ textDecoration: 'none' }}
      >
        {intl.formatMessage(globalMessages.learnMore)}
      </Link>
    );

    const smartContractsLink = (
      <Link
        href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/4415793858959-What-are-smart-contracts"
        target="_blank"
        rel="noreferrer"
        sx={{ textDecoration: 'none' }}
      >
        {intl.formatMessage(globalMessages.smartContracts).toLowerCase()}
      </Link>
    );

    return (
      <Box overflowWrap="break-word" display="flex" height="100%" flexDirection="column">
        <Box padding="32px" flex="1" flexGrow="1" overflow="auto">
          <Typography
            textAlign="center"
            color="var(--yoroi-palette-gray-900)"
            variant="h5"
            marginBottom="8px"
          >
            {intl.formatMessage(messages.reorgTitle)}
          </Typography>
          <Box textAlign="center" my="32px">
            <AddCollateralIcon />
          </Box>
          <Typography>
            <FormattedMessage
              {...messages.reorgMessage}
              values={{
                learnMoreLink,
                smartContractsLink,
                lineBreak: <br />,
              }}
            />
          </Typography>
          <Box pt="32px">
            <Box
              width="100%"
              padding="16px"
              border="1px solid var(--yoroi-palette-gray-100)"
              borderRadius="6px"
              display="flex"
              flexDirection="column"
              gap="16px"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>{intl.formatMessage(globalMessages.amount)}</Typography>
                <Typography>
                  {this.renderAmountDisplay({
                    entry: {
                      identifier: txData.fee.tokenId,
                      networkId: txData.fee.networkId,
                      amount: txAmount,
                    },
                  })}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>{intl.formatMessage(signTxMessages.transactionFee)}</Typography>
                <Typography>
                  {this.renderAmountDisplay({
                    entry: {
                      identifier: txData.fee.tokenId,
                      networkId: txData.fee.networkId,
                      amount: txFeeAmount,
                    },
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box mt="26px">
            <TextField
              type="password"
              {...walletPasswordField.bind()}
              error={walletPasswordField.error}
            />
            {submissionError === 'SEND_TX_ERROR' && (
              <Alert severity="error">{intl.formatMessage(messages.sendError)}</Alert>
            )}
          </Box>
        </Box>
        <Box padding="32px" borderTop="1px solid var(--yoroi-palette-gray-300)">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridGap: '15px',
            }}
          >
            <Button sx={{ minWidth: 'auto' }} fullWidth variant="secondary" onClick={onCancel}>
              {intl.formatMessage(globalMessages.backButtonLabel)}
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
    );
  }
}

export default AddCollateralPage;
