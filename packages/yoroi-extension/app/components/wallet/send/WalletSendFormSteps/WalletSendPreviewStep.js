// @flow

/* eslint react/jsx-one-expression-per-line: 0 */  // the &nbsp; in the html breaks this

import type { Node } from 'react';
import React, { Component, } from 'react';
import { observer } from 'mobx-react';
import TextField from '../../../common/TextField';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import ReactToolboxMobxForm from '../../../../utils/ReactToolboxMobxForm';
import vjf from 'mobx-react-form/lib/validators/VJF';
import globalMessages from '../../../../i18n/global-messages';
import LocalizableError from '../../../../i18n/LocalizableError';
import styles from './WalletSendPreviewStep.scss';
import config from '../../../../config';
import { SelectedExplorer } from '../../../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../../../utils/unit-of-account';
import WarningBox from '../../../widgets/WarningBox';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import {
  truncateToken,
} from '../../../../utils/formatters';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../../api/common/lib/MultiToken';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { getTokenName, genFormatTokenAmount } from '../../../../stores/stateless/tokenHelpers';
import AssetsDropdown from './AssetsDropdown';
import { Button, Link, Tooltip, Typography } from '@mui/material';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import { getNFTs, getTokens } from '../../../../utils/wallet';
import { IncorrectWalletPasswordError } from '../../../../api/common/errors';
import { isCardanoHaskell } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import { Box } from '@mui/system';
import { ReactComponent as InfoIcon }  from '../../../../assets/images/attention-big-light.inline.svg';

type Props = {|
  +staleTx: boolean,
  +selectedExplorer: SelectedExplorer,
  +amount: MultiToken,
  +receivers: Array<string>,
  +totalAmount: MultiToken,
  +transactionFee: MultiToken,
  +transactionSize: ?string,
  +onSubmit: ({| password: string |}) => PossiblyAsync<void>,
  +addressToDisplayString: string => string,
  +onCancel: void => void,
  +isSubmitting: boolean,
  +error: ?LocalizableError,
  +classicTheme: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +getCurrentPrice: (from: string, to: string) => ?string,
|};

const messages = defineMessages({
  nAssets: {
    id: 'wallet.send.form.preview.nAssets',
    defaultMessage: '!!!{number} Assets',
  },
  minAdaHelp: {
    id: 'wallet.send.form.preview.minAdaHelp',
    defaultMessage: '!!!Minimum ADA required to send these assets. {moreDetails}'
  },
  moreDetails: {
    id: 'wallet.send.form.preview.moreDetails',
    defaultMessage: '!!!More details here',
  }
});

@observer
export default class WalletSendPreviewStep extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state = {
    passwordError: null,
    txError: null
  }

  form: ReactToolboxMobxForm = new ReactToolboxMobxForm({
    fields: {
      walletPassword: {
        type: 'password',
        label: this.context.intl.formatMessage(globalMessages.walletPasswordLabel),
        placeholder: this.props.classicTheme ?
          this.context.intl.formatMessage(globalMessages.walletPasswordFieldPlaceholder) : '',
        value: '',
        validators: [({ field }) => {
          if (field.value === '') {
            return [false, this.context.intl.formatMessage(globalMessages.fieldIsRequired)];
          }
          return [true];
        }],
      },
    }
  }, {
    options: {
      validateOnChange: true,
      validationDebounceWait: config.forms.FORM_VALIDATION_DEBOUNCE_WAIT,
    },
    plugins: {
      vjf: vjf()
    },
  });

  submit(): void {
    this.form.submit({
      onSuccess: async (form) => {
        const { walletPassword } = form.values();
        const transactionData = {
          password: walletPassword,
        };
        try {
          await this.props.onSubmit(transactionData);
        } catch (error) {
          const errorMessage = this.context.intl.formatMessage(error, error.values)
          if (error instanceof IncorrectWalletPasswordError) {
            this.setState({ passwordError: errorMessage })
          } else {
            this.setState({ txError: errorMessage })
          }
        }
      },
      onError: () => {}
    });
  }

  convertedToUnitOfAccount: (TokenEntry, string) => string = (token, toCurrency) => {
    const tokenInfo = this.props.getTokenInfo(token);

    const shiftedAmount = token.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    const ticker = tokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const coinPrice = this.props.getCurrentPrice(ticker, toCurrency);

    if (coinPrice == null) return '-';

    return calculateAndFormatValue(
      shiftedAmount,
      coinPrice
    );
  }

  renderSingleAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    return (
      <div className={styles.amount}>{formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
            truncateToken(getTokenName(this.props.getTokenInfo(entry)))
          }
        </span>
      </div>
    );
  }

  renderTotalAmount: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);

    const { unitOfAccountSetting } = this.props;
    return unitOfAccountSetting.enabled
      ? (
        <>
          <div className={styles.totalAmount}>{formatValue(entry)}
            <span className={styles.currencySymbol}>&nbsp;{
              truncateToken(getTokenName(this.props.getTokenInfo(entry)))
            }
            </span>
          </div>
          <div className={styles.totalFiatAmount}>
            {this.convertedToUnitOfAccount(entry, unitOfAccountSetting.currency)}
            <span className={styles.currencySymbol}>
              &nbsp;{unitOfAccountSetting.currency}
            </span>
          </div>
        </>
      ) : (
        <div className={styles.totalAmount}>{formatValue(entry)}
          <span className={styles.currencySymbol}>&nbsp;{
            truncateToken(getTokenName(this.props.getTokenInfo(entry)))
          }
          </span>
        </div>
      );
  }
  renderSingleFee: TokenEntry => Node = (entry) => {
    const formatValue = genFormatTokenAmount(this.props.getTokenInfo);
    return(
      <div className={styles.fees}>
        {formatValue(entry)}
        <span className={styles.currencySymbol}>&nbsp;{
            truncateToken(getTokenName(this.props.getTokenInfo(
              entry
            )))
          }
        </span>
      </div>
    );
  }

  renderBundle: {|
    amount: MultiToken,
    render: TokenEntry => Node,
  |} => Node = (request) => {
    return (
      <>
        {request.render(request.amount.getDefaultEntry())}
        {request.amount.nonDefaultEntries().map(entry => (
          <React.Fragment key={entry.identifier}>
            {request.render(entry)}
          </React.Fragment>
        ))}
      </>
    );
  }

  _amountLabel = () => {
    const {
      selectedNetwork,
      plannedTxInfoMap,
      minAda
    } = this.props;
    const { intl } = this.context;
    const isCardano = isCardanoHaskell(selectedNetwork);


    if (isCardano) {
      const tokenInfo = plannedTxInfoMap.find(({ token }) => token.IsDefault);
      if (
        (!tokenInfo || !tokenInfo.amount || minAda.getDefaultEntry().amount.gt(tokenInfo.amount)) &&
        !tokenInfo?.shouldSendAll
      ) {
        const moreDetailsLink = (
          <Link
            href="https://emurgohelpdesk.zendesk.com/hc/en-us/articles/5008187102351-What-is-the-locked-assets-deposit-"
            target='_blank'
            rel="noreferrer noopener"
            sx={{
              color: 'inherit',
              textDecoration: 'underline'
            }}
          >
            {intl.formatMessage(messages.moreDetails)}
          </Link>
        )
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {intl.formatMessage(globalMessages.minAda)}

            <Tooltip
              placement='top'
              title={
                <Typography>
                  <FormattedMessage
                    {...messages.minAdaHelp}
                    values={{ moreDetails: moreDetailsLink }}
                  />
                </Typography>
              }
            >
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '10px',
                '& > svg': {
                    width: 20,
                    height: 20,
                  }
                }}
              >
                <InfoIcon />
              </Box>
            </Tooltip>
          </Box>
        )
      }
    }

    return (
      <Box>
        {intl.formatMessage(globalMessages.amountLabel)}
      </Box>
    );
  }

  render(): Node {
    const { form } = this;
    const { intl } = this.context;
    const walletPasswordField = form.$('walletPassword');
    const {
      amount,
      receivers,
      isSubmitting,
    } = this.props;
    const { passwordError, txError } = this.state;

    const staleTxWarning = (
      <div className={styles.warningBox}>
        <WarningBox>
          {intl.formatMessage(globalMessages.staleTxnWarningLine1)}<br />
          {intl.formatMessage(globalMessages.staleTxnWarningLine2)}
        </WarningBox>
      </div>
    );

    return (
      <div className={styles.component}>
        {
          txError && (
            <div className={styles.txError}>
              {txError}
            </div>
          )
        }
        <div className={styles.staleTxWarning}>
          {this.props.staleTx && staleTxWarning}
        </div>
        <div>
          <div className={styles.addressToLabel}>
            {intl.formatMessage(globalMessages.receiverLabel)}
          </div>
          <p className={styles.receiverAddress}>
            {this.props.addressToDisplayString(receivers[0])}
          </p>
        </div>
        <div className={styles.wrapper}>
          {this.props.transactionSize != null ? (
            <div className={styles.addressToLabelWrapper}>
              <div className={styles.addressToLabel}>
                {intl.formatMessage(globalMessages.walletSendConfirmationTxSizeLabel)}
              </div>
              <span className={styles.txSize}>
                {this.props.transactionSize}
              </span>
            </div>
          ) : null}

          <div className={styles.amountFeesWrapper}>
            {(amount.nonDefaultEntries().length > 0) &&
            (<AssetsDropdown
              tokens={getTokens(amount, this.props.getTokenInfo)}
              nfts={getNFTs(amount, this.props.getTokenInfo)}
            />)}
            <div className={styles.amountWrapper}>
              <div className={styles.amountLabel}>
                {this._amountLabel()}
              </div>
              <div className={styles.amountValue}>
                {this.renderSingleAmount(amount.getDefaultEntry())}
              </div>
            </div>

            <div className={styles.feesWrapper}>
              <div className={styles.feesLabel}>
                {intl.formatMessage(globalMessages.transactionFee)}
              </div>
              <div className={styles.feesValue}>
                {this.renderBundle({
                  amount: this.props.transactionFee,
                  render: this.renderSingleFee,
                })}
              </div>
            </div>
          </div>

          <div className={styles.totalAmountWrapper}>
            <div className={styles.totalAmountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </div>
            <div>
              {amount.nonDefaultEntries().length > 0 && (
                <div className={styles.assetsCount}>
                  {intl.formatMessage(messages.nAssets, {
                    number: amount.nonDefaultEntries().length
                  })}
                </div>
              )}

              <div className={styles.totalAmountValue}>
                {this.renderTotalAmount(this.props.totalAmount.getDefaultEntry())}
              </div>
            </div>
          </div>

          <TextField
            type="password"
            className={styles.walletPassword}
            {...walletPasswordField.bind()}
            disabled={isSubmitting}
            onChange={(e) => {
              this.setState({ passwordError: null })
              walletPasswordField.set('value', e.target.value)
            }}
            error={walletPasswordField.error || passwordError}
          />
        </div>

        <Button
          variant="primary"
          onClick={this.submit.bind(this)}
          disabled={!walletPasswordField.isValid || isSubmitting}
          sx={{ display: 'block', padding: '0px', marginTop: '9px' }}
        >
          {isSubmitting ?
            <LoadingSpinner light /> :
            intl.formatMessage(globalMessages.sendButtonLabel)}
        </Button>

      </div>
    );
  }
}
