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
import { WrongPassphraseError } from '../../../api/ada/lib/cardanoCrypto/cryptoErrors';
import { LoadingButton } from '@mui/lab';
import { ReactComponent as AddCollateralIcon } from '../../../assets/images/dapp-connector/add-collateral.inline.svg';
import type LocalizableError from '../../../i18n/LocalizableError';
import ErrorBlock from '../../../components/widgets/ErrorBlock';

type Props = {|
  +txData: ?CardanoConnectorSignRequest,
  +onCancel: () => void,
  +onConfirm: string => Promise<void>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => ?$ReadOnly<TokenRow>,
  +selectedExplorer: SelectedExplorer,
  +submissionError: ?SignSubmissionErrorType,
  +walletType: 'ledger' | 'trezor' | 'web',
  +hwWalletError: ?LocalizableError,
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
    defaultMessage: '!!!To interact with {smartContractsLink} in Cardano you should add collateral, which means to make a 0 ADA transaction.{lineBreak}{lineBreak}It is a guarantee that prevent from failing smart contracts and scams. {learnMoreLink} about collateral.',
  },
  sendError: {
    id: 'connector.signin.error.sendError',
    defaultMessage: '!!!An error occured when sending the transaction.',
  },
  transactionFee: {
    id: 'connector.signin.transactionFee',
    defaultMessage: '!!!Transaction Fee',
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

    const { walletType } = this.props;
    let confirmButtonLabel;
    switch (walletType) {
      case 'ledger':
        confirmButtonLabel = globalMessages.confirmOnLedger;
        break;
      case 'trezor':
        confirmButtonLabel = globalMessages.confirmOnTrezor;
        break;
      default:
        confirmButtonLabel = globalMessages.confirm;
        break;
    }

    return (
      <Box overflowWrap="break-word" display="flex" height="100%" flexDirection="column">
        <Box maxWidth={480} margin="0 auto" padding="32px" flex="1" flexGrow="1" overflow="auto">
          <Typography component="div"
            textAlign="center"
            color="gray.900"
            variant="h4"
            fontWeight={500}
            marginBottom="8px"
            fontSize="20px"
            id="addCollateralTitle"
          >
            {intl.formatMessage(messages.reorgTitle)}
          </Typography>
          <Box textAlign="center" my="32px">
            <AddCollateralIcon />
          </Box>
          <Typography component="div">
            <FormattedMessage
              {...messages.reorgMessage}
              values={{
                learnMoreLink,
                smartContractsLink,
                lineBreak: <br />,
              }}
            />
          </Typography>
          <Box pt="24px">
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
                <Typography component="div">{intl.formatMessage(globalMessages.amount)}</Typography>
                <Typography component="div" id="addCollateralAmountTitle">
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
                <Typography component="div">{intl.formatMessage(messages.transactionFee)}</Typography>
                <Typography component="div" id="addCollateralFeeTitle">
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
          {walletType === 'web' && (
            <Box mt="24px">
              <TextField
                type="password"
                {...walletPasswordField.bind()}
                error={walletPasswordField.error}
                id="walletPassword"
              />
              {submissionError === 'SEND_TX_ERROR' && (
                <Alert severity="error">{intl.formatMessage(messages.sendError)}</Alert>
              )}
            </Box>
          )}
        </Box>

        {this.props.hwWalletError && <ErrorBlock error={this.props.hwWalletError} />}

        <Box borderTop="1px solid var(--yoroi-palette-gray-300)">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridGap: '15px',
              maxWidth: 480,
              margin: '0 auto',
              padding: '32px',
            }}
          >
            <Button
              sx={{
                // width: '144px',
                height: '40px',
                minWidth: 'unset',
                minHeight: 'unset',
                fontSize: '14px',
                lineHeight: '15px',
              }}
              disableRipple={false}
              variant="outlined"
              color="primary"
              onClick={onCancel}
              id="cancelButton"
            >
              {intl.formatMessage(globalMessages.backButtonLabel)}
            </Button>
            <LoadingButton
              sx={{ minWidth: 'auto' }}
              variant="contained"
              fullWidth
              disabled={walletType === 'web' && !walletPasswordField.isValid}
              onClick={this.submit.bind(this)}
              loading={isSubmitting}
              id="confirmButton"
            >
              {intl.formatMessage(confirmButtonLabel)}
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default AddCollateralPage;
