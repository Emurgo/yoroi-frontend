/* eslint-disable no-nested-ternary */
// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { TransactionDirectionType } from '../../../api/ada/transactions/types';
import type { AssuranceLevel } from '../../../types/transactionAssurance.types';
import type { TxStatusCodesType } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { CertificateRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import type { Notification } from '../../../types/notification.types';
import type { TxDataOutput, TxDataInput } from '../../../api/common/types';
import type { TokenLookupKey, TokenEntry } from '../../../api/common/lib/MultiToken';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import classnames from 'classnames';
import BigNumber from 'bignumber.js';
import { Button, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { ReactComponent as AddMemoSvg } from '../../../assets/images/revamp/add-memo.inline.svg';
import { ReactComponent as EditSvg } from '../../../assets/images/edit.inline.svg';
import { ReactComponent as SendIcon } from '../../../assets/images/transaction/send.inline.svg';
import { ReactComponent as StakeIcon } from '../../../assets/images/transaction/stake.inline.svg';
import { ReactComponent as ReceiveIcon } from '../../../assets/images/transaction/receive.inline.svg';
import { ReactComponent as RewardIcon } from '../../../assets/images/transaction/reward.inline.svg';
import { ReactComponent as ErrorIcon } from '../../../assets/images/transaction/error.inline.svg';
import { ReactComponent as ExpandArrow } from '../../../assets/images/expand-arrow-grey.inline.svg';
import styles from './Transaction.scss';
import WalletTransaction from '../../../domain/WalletTransaction';
import CardanoShelleyTransaction from '../../../domain/CardanoShelleyTransaction';
import globalMessages, { memoMessages } from '../../../i18n/global-messages';
import { transactionTypes } from '../../../api/ada/transactions/types';
import { Logger } from '../../../utils/logging';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { TxStatusCodes } from '../../../api/ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import CopyableAddress from '../../widgets/CopyableAddress';
import { genAddressLookup } from '../../../stores/stateless/addressStores';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import { getTokenName, getTokenIdentifierIfExists, assetNameFromIdentifier } from '../../../stores/stateless/tokenHelpers';
import { parseMetadata, parseMetadataDetailed } from '../../../api/ada/lib/storage/bridge/metadataUtils';
import CodeBlock from '../../widgets/CodeBlock';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import { assuranceLevelTranslations, shelleyCertificateKinds, stateTranslations, messages } from './Transaction';

type Props = {|
  +data: WalletTransaction,
  +numberOfConfirmations: ?number,
  +memo: void | $ReadOnly<TxMemoTableRow>,
  +state: TxStatusCodesType,
  +selectedExplorer: SelectedExplorer,
  +assuranceLevel: AssuranceLevel,
  isLastInList: boolean,
  +shouldHideBalance: boolean,
  +onAddMemo: WalletTransaction => void,
  +onEditMemo: WalletTransaction => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string,
  +addressLookup: ReturnType<typeof genAddressLookup>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +addressToDisplayString: string => string,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +complexityLevel: ?ComplexityLevelType,
  id: string,
  txIndex: number,
|};

type State = {|
  isExpanded: boolean,
|};

@observer
export default class TransactionRevamp extends Component<Props, State> {
  static contextTypes: {|
    intl: $npm$ReactIntl$IntlFormat,
  |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isExpanded: false,
  };

  toggleDetails: void => void = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  };

  getTxType(
    intl: $npm$ReactIntl$IntlFormat,
    currency: string,
    data: WalletTransaction
  ): {|
    icon: string,
    msg: string,
  |} {
    const { type } = data;
    if (type === transactionTypes.EXPEND) {
      return { icon: 'send', msg: intl.formatMessage(messages.sent, { currency }) };
    }
    if (type === transactionTypes.INCOME) {
      return { icon: 'receive', msg: intl.formatMessage(messages.received, { currency }) };
    }
    if (type === transactionTypes.SELF) {
      if (data instanceof CardanoShelleyTransaction) {
        const features = data.getFeatures();
        if (
          (features.includes('Withdrawal') && features.length === 1) ||
          (features.includes('Withdrawal') && features.includes('StakeDeregistration') && features.length === 2)
        ) {
          return {
            icon: 'reward',
            msg: intl.formatMessage({ id: 'wallet.transaction.type.rewardWithdrawn' }),
          };
        }
        if (features.includes('CatalystVotingRegistration') && features.length === 1) {
          return { icon: 'reward', msg: intl.formatMessage(messages.catalystVotingRegistered) };
        }
        if (
          (features.includes('StakeDelegation') && features.length === 1) ||
          (features.includes('StakeDelegation') && features.includes('StakeRegistration') && features.length === 2)
        ) {
          return { icon: 'stake', msg: intl.formatMessage(messages.stakeDelegated) };
        }
        if (features.includes('StakeRegistration') && features.length === 1) {
          return { icon: 'stake', msg: intl.formatMessage(messages.stakeKeyRegistered) };
        }
      }
      return { icon: 'send', msg: intl.formatMessage(messages.intrawallet, { currency }) };
    }
    if (type === transactionTypes.MULTI) {
      // can happen for example in Cardano
      // if you claim a reward from an account doesn't belong to you
      // you have an input to pay the tx fee
      // there is an input you don't own (the withdrawal)
      // you have an output to receive change + withdrawal amount
      return { icon: 'receive', msg: intl.formatMessage(messages.multiparty, { currency }) };
    }
    // unused
    if (type === transactionTypes.EXCHANGE) {
      Logger.error('EXCHANGE type transactions not supported');
      return { icon: '', msg: '???' };
    }
    Logger.error('Unknown transaction type');
    return { icon: '', msg: '???' };
  }

  getStatusString(intl: $npm$ReactIntl$IntlFormat, state: number, assuranceLevel: AssuranceLevel, isValid: boolean): string {
    if (!isValid) {
      return intl.formatMessage(stateTranslations.failed);
    }
    if (state === TxStatusCodes.IN_BLOCK) {
      return intl.formatMessage(assuranceLevelTranslations[assuranceLevel]);
    }
    if (state === TxStatusCodes.PENDING) {
      return intl.formatMessage(stateTranslations.pending);
    }
    if (state === TxStatusCodes.SUBMITTED) {
      return intl.formatMessage(stateTranslations.submitted);
    }
    if (state < 0) {
      return intl.formatMessage(stateTranslations.failed);
    }
    throw new Error(`${nameof(this.getStatusString)} unexpected state ` + state);
  }

  renderAmountDisplay: ({|
    entry: TokenEntry,
    getRawNumber?: boolean,
  |}) => Node | string = request => {
    if (this.props.shouldHideBalance) {
      return <span>{hiddenAmount}</span>;
    }
    const tokenInfo = this.props.getTokenInfo(request.entry);
    const numberOfDecimals = tokenInfo?.Metadata.numberOfDecimals ?? 0;
    const shiftedAmount = request.entry.amount.shiftedBy(-numberOfDecimals);

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, numberOfDecimals);

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-') ? beforeDecimalRewards : '+' + beforeDecimalRewards;

    if (request.getRawNumber === true) {
      return adjustedBefore + afterDecimalRewards;
    }

    return (
      <>
        {adjustedBefore}
        <Typography as="span" fontWeight="inherit" fontSize="inherit">
          {afterDecimalRewards}
        </Typography>
      </>
    );
  };

  renderAmountWithUnitOfAccount: ({|
    entry: TokenEntry,
    timestamp: number,
  |}) => ?Node = request => {
    const { currency } = this.props.unitOfAccountSetting;

    if (this.props.unitOfAccountSetting.enabled) {
      const tokenInfo = this.props.getTokenInfo(request.entry);
      const shiftedAmount = request.entry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      if (currency == null) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }

      if (this.props.shouldHideBalance) {
        return (
          <>
            <Typography variant="body1" fontWeight={500} textAlign="right">
              <span>{hiddenAmount}</span>
              {ticker}
            </Typography>
            <Typography variant="body2" color="grayscale.600" textAlign="right">
              {hiddenAmount}&nbsp;{currency}
            </Typography>
          </>
        );
      }

      const price = this.props.getHistoricalPrice(ticker, currency, request.timestamp);
      let fiatDisplay = '-';
      if (price != null) {
        const amount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = amount.split('.');
        const beforeDecimalWithSign = beforeDecimal.startsWith('-') ? beforeDecimal : '+' + beforeDecimal;
        fiatDisplay = (
          <>
            {beforeDecimalWithSign}
            {afterDecimal && (
              <Typography as="span" fontWeight="inherit" fontSize="inherit">
                .{afterDecimal}
              </Typography>
            )}
          </>
        );
      }
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backgroundColor: 'ds.bg_color_max',
          }}
        >
          <Typography variant="body1" fontWeight={500} color="grayscale.900">
            {this.renderAmountDisplay({ entry: request.entry })} {this.getTicker(request.entry)}
          </Typography>
          <Typography variant="body2" color="grayscale.600" textAlign="right">
            {fiatDisplay}&nbsp;{currency}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography variant="body1" fontWeight={500} color="grayscale.900" textAlign="right">
        {this.renderAmountDisplay({ entry: request.entry })} {this.getTicker(request.entry)}
      </Typography>
    );
  };

  renderFeeDisplay: ({|
    amount: MultiToken,
    type: TransactionDirectionType,
    timestamp: number,
  |}) => Node = request => {
    if (request.type === transactionTypes.INCOME) {
      return (
        <Typography as="span" fontSize="inherit">
          -
        </Typography>
      );
    }
    if (this.props.shouldHideBalance) {
      return <span>{hiddenAmount}</span>;
    }
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals).abs();

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

    if (this.props.unitOfAccountSetting.enabled) {
      const { currency } = this.props.unitOfAccountSetting;
      if (currency == null) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getHistoricalPrice(ticker, currency, request.timestamp);

      let fiatDisplay;
      if (price != null) {
        const amount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = amount.split('.');
        fiatDisplay = (
          <>
            {beforeDecimal}
            {afterDecimal && <span className={styles.afterDecimal}>.{afterDecimal}</span>}
          </>
        );
      } else {
        fiatDisplay = '-';
      }
      return (
        <>
          <Typography variant="body1" fontWeight={500} color="grayscale.900">
            {beforeDecimalRewards}
            <span className={styles.afterDecimal}>{afterDecimalRewards}</span> {this.getTicker(defaultEntry)}
          </Typography>
          <Typography variant="body2" color="grayscale.600" textAlign="right">
            {fiatDisplay}&nbsp;{currency}
          </Typography>
        </>
      );
    }

    return (
      <Typography variant="body1" fontWeight={500} color="grayscale.900">
        {[beforeDecimalRewards, afterDecimalRewards].join('')} {this.getTicker(defaultEntry)}
      </Typography>
    );
  };

  getTicker: TokenEntry => string = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    return tokenInfo != null ? truncateToken(getTokenName(tokenInfo)) : assetNameFromIdentifier(tokenEntry.identifier);
  };

  getFingerprint: TokenEntry => string | void = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    if (tokenInfo?.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  };

  renderAssets: ({|
    assets: Array<TokenEntry>,
  |}) => Node = request => {
    if (request.assets.length === 0) {
      return null;
    }
    if (request.assets.length === 1) {
      const entry = request.assets[0];
      return (
        <div className={classnames([styles.asset])}>
          {this.renderAmountDisplay({ entry })} {this.getTicker(entry)}
        </div>
      );
    }
    // request.assets.length > 1

    // display sign only if all amounts are either the same sign or zero
    let sign = undefined;
    for (const entry of request.assets) {
      if (entry.amount.isPositive()) {
        if (sign === '-') {
          sign = null;
          break;
        }
        sign = '+';
      } else if (entry.amount.isNegative()) {
        if (sign === '+') {
          sign = null;
          break;
        }
        sign = '-';
      }
    }

    return (
      <div className={classnames([styles.asset])}>
        {sign}
        {request.assets.length} {this.context.intl.formatMessage(globalMessages.assets)}
      </div>
    );
  };

  renderRow: ({|
    kind: string,
    data: WalletTransaction,
    address: TxDataOutput | TxDataInput,
    addressIndex: number,
    transform?: BigNumber => BigNumber,
    addressRowId: string,
  |}) => Node = request => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-${request.data.txid}-copyNotification`;
    const divKey = identifier =>
      `${request.data.txid}-${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = entry => {
      const fingerprint = this.getFingerprint(entry);
      return (
        <div className={styles.fee}>
          <Typography color="grayscale.600" variant="caption1">
            {this.renderAmountDisplay({
              entry: {
                ...entry,
                amount: request.transform ? request.transform(entry.amount) : entry.amount,
              },
            })}{' '}
          </Typography>
          {fingerprint !== undefined ? (
            <ExplorableHashContainer selectedExplorer={this.props.selectedExplorer} hash={fingerprint} light linkType="token">
              <Typography variant="caption1" color="grayscale.600">
                {this.getTicker(entry)}
              </Typography>
            </ExplorableHashContainer>
          ) : (
            this.getTicker(entry)
          )}
        </div>
      );
    };

    return (
      <Box
        sx={{
          display: 'grid',
          gap: '15px',
          gridTemplateColumns: 'minmax(232px, 1fr) 105px 1fr',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        key={divKey(request.address.value.getDefaultEntry().identifier)}
      >
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={() => this.props.onCopyAddressTooltip(request.address.address, notificationElementId)}
          notification={this.props.notification}
          placementTooltip="bottom-start"
          id={request.addressRowId}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <Typography variant="caption1" color="grayscale.600" id={request.addressRowId + '-truncatedAddress-text'}>
              {truncateAddressShort(this.props.addressToDisplayString(request.address.address))}
            </Typography>
          </ExplorableHashContainer>
        </CopyableAddress>
        <Box textAlign="center">{this.generateAddressButton(request.address.address)}</Box>
        <Typography
          textAlign="center"
          component="span"
          variant="caption1"
          color="grayscale.600"
          id={request.addressRowId + '-amount-text'}
        >
          {renderAmount(request.address.value.getDefaultEntry())}
        </Typography>
        {request.address.value.nonDefaultEntries().map(entry => (
          <React.Fragment key={divKey(entry.identifier)}>
            <div />
            <div />
            {renderAmount(entry)}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  render(): Node {
    const data = this.props.data;
    const { state, assuranceLevel, onAddMemo, onEditMemo } = this.props;
    const { isExpanded } = this.state;
    const { intl } = this.context;
    const isSubmittedTransaction = state === TxStatusCodes.SUBMITTED;
    const isFailedTransaction = state < 0 && !isSubmittedTransaction;
    const isPendingTransaction = state === TxStatusCodes.PENDING || isSubmittedTransaction;
    const isValidTransaction = data instanceof CardanoShelleyTransaction ? data.isValid : true;

    const contentStyles = classnames(styles.content);

    const detailsStyles = classnames([styles.details, isExpanded ? styles.expanded : styles.closed]);

    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const status = this.getStatusString(intl, state, assuranceLevel, isValidTransaction);
    const txType = this.getTxType(intl, this.getTicker(data.amount.getDefaultEntry()), data);

    const txIdBasePart = `${this.props.id}:transaction_${this.props.txIndex}`;
    const txIdFullInfoBasePart = `${txIdBasePart}:txFullInfo`;

    return (
      <Box
        className={styles.component}
        id={this.props.id + '-transaction_' + this.props.txIndex + '-box'}
        sx={{ backgroundColor: 'ds.bg_color_max' }}
      >
        {/* ==== Clickable Header -> toggles details ==== */}
        <Box
          sx={{ padding: '20px 0', cursor: 'pointer' }}
          onClick={this.toggleDetails.bind(this)}
          role="presentation"
          aria-hidden
        >
          <Grid
            container
            sx={{
              width: '100%',
            }}
          >
            <Grid
              item
              xs={4}
              sx={{
                display: 'flex',
                gap: '16px',
              }}
            >
              <TypeIcon type={txType.icon} />
              <Box>
                <Typography variant="body1" color="grayscale.900" id={txIdBasePart + '-txType-text'}>
                  {txType.msg}
                </Typography>
                <Typography variant="caption1" color="grayscale.600" id={txIdBasePart + '-txTime-text'}>
                  {moment(data.date).format('hh:mm A')}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'left' }}>
              {state === TxStatusCodes.IN_BLOCK ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: isPendingTransaction ? 'grayscale.400' : 'grayscale.900',
                    textTransform: 'capitalize',
                  }}
                  id={txIdBasePart + '-txStatus-text'}
                >
                  {status}
                </Typography>
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    color: isFailedTransaction
                      ? 'var(--yoroi-palette-error-100)'
                      : isPendingTransaction
                      ? 'grayscale.400'
                      : 'grayscale.900',
                    textTransform: 'capitalize',
                  }}
                  id={txIdBasePart + '-txStatus-text'}
                >
                  {status}
                </Typography>
              )}
            </Grid>
            <Grid
              item
              xs={2}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
              }}
            >
              <Typography component="div" variant="body1" color="grayscale.900" id={txIdBasePart + '-txFee-text'}>
                {this.renderFeeDisplay({
                  amount: data.fee,
                  type: data.type,
                  timestamp: data.date.valueOf(),
                })}
              </Typography>
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <Box textAlign="right">
                <Typography
                  component="div"
                  variant="body1"
                  fontWeight="500"
                  color="grayscale.900"
                  textAlign="left"
                  id={txIdBasePart + '-txAmount-text'}
                >
                  {this.renderAmountWithUnitOfAccount({
                    entry: data.amount.getDefaultEntry(),
                    timestamp: data.date.valueOf(),
                  })}
                </Typography>
                <Typography component="div" id={txIdBasePart + '-txAmountAssets-text'}>
                  {this.renderAssets({ assets: data.amount.nonDefaultEntries() })}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className={arrowClasses}
                >
                  <ExpandArrow />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ==== Toggleable Transaction Details ==== */}
        <Box
          className={contentStyles}
          sx={{
            overflowX: 'overlay',
            bgcolor: 'ds.bg_color_max',
            border: isExpanded ? '1px solid' : 'none',
            borderColor: 'grayscale.200',
            borderRadius: '8px',
            mt: '8px',
          }}
        >
          <Box className={detailsStyles} sx={{ borderBottom: isExpanded ?? '1px solid', borderColor: 'ds.gray_200' }}>
            {/* converting assets is not implemented but we may use it in the future for tokens */}
            {data.type === transactionTypes.EXCHANGE && (
              <div className={styles.conversion}>
                <div>
                  <h2>{intl.formatMessage(messages.exchange)}</h2>
                </div>
                <div className={styles.conversionRate}>
                  <h2>{intl.formatMessage(messages.conversionRate)}</h2>
                </div>
              </div>
            )}
            <Box sx={{ overflowX: 'overlay', bgcolor: 'ds.bg_color_max' }}>
              <Box className={styles.addressContent} sx={{ border: '1px solid', borderColor: 'ds.gray_200' }}>
                <div>
                  <Box
                    sx={{
                      px: '24px',
                      display: 'grid',
                      color: 'grayscale.max',
                      gap: '15px',
                      gridTemplateColumns: 'minmax(232px, 1fr) 105px 1fr',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption1">
                      {intl.formatMessage(globalMessages.fromAddresses)}:{' '}
                      <span style={{ fontWeight: 500 }} id={txIdFullInfoBasePart + ':fromAddresses-addressesAmount-text'}>
                        {data.addresses.from.length}
                      </span>
                    </Typography>
                    <Typography variant="caption1" textAlign="center">
                      {intl.formatMessage(messages.addressType)}
                    </Typography>
                    <Typography variant="caption1" textAlign="center">
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </Typography>
                  </Box>
                  <Box
                    className={styles.addressList}
                    sx={{ color: 'grayscale.600', borderBottom: '1px solid', borderColor: 'ds.gray_200' }}
                  >
                    {data.addresses.from.map((address, addressIndex) => {
                      const addressRowId = `${txIdFullInfoBasePart}:fromAddresses:address_${addressIndex}`;
                      return this.renderRow({
                        kind: 'in',
                        data,
                        address,
                        addressIndex,
                        transform: amount => amount.abs().negated(), // ensure it shows as negative
                        addressRowId,
                      });
                    })}
                  </Box>
                </div>
                <Box sx={{ borderLeft: '1px solid', borderColor: 'grayscale.200' }}>
                  <Box
                    sx={{
                      px: '24px',
                      display: 'grid',
                      color: 'grayscale.max',
                      gap: '15px',
                      gridTemplateColumns: 'minmax(232px, 1fr) 105px 1fr',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption1">
                      {intl.formatMessage(globalMessages.toAddresses)}:{' '}
                      <span style={{ fontWeight: 500 }} id={txIdFullInfoBasePart + ':toAddresses-addressesAmount-text'}>
                        {data.addresses.to.length}
                      </span>
                    </Typography>
                    <Typography variant="caption1" textAlign="center">
                      {intl.formatMessage(messages.addressType)}
                    </Typography>
                    <Typography variant="caption1" textAlign="center">
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </Typography>
                  </Box>
                  <div className={styles.addressList}>
                    {data.addresses.to.map((address, addressIndex) => {
                      const addressRowId = `${txIdFullInfoBasePart}:toAddresses:address_${addressIndex}`;
                      return this.renderRow({
                        kind: 'out',
                        data,
                        address,
                        addressIndex,
                        addressRowId,
                      });
                    })}
                  </div>
                </Box>
              </Box>
              {this.getWithdrawals(data, txIdFullInfoBasePart)}
              {this.getCertificate(data, txIdFullInfoBasePart)}

              <Box display="flex" p="24px">
                <Box flexShrink={0}>
                  {state === TxStatusCodes.IN_BLOCK && this.props.numberOfConfirmations != null && (
                    <Box display="flex" gap="8px" mb="16px" flexDirection="column">
                      <Typography variant="caption1" fontWeight={500}>
                        {intl.formatMessage(messages.assuranceLevel)}
                      </Typography>
                      <Typography variant="caption1" color="grayscale.600">
                        <span className={styles.assuranceLevel}>{status}</span>.{' '}
                        <span className="confirmationCount" id={txIdFullInfoBasePart + '-numberOfConfirmations-text'}>
                          {this.props.numberOfConfirmations}
                        </span>{' '}
                        {intl.formatMessage(messages.confirmations)}.
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" gap="8px" mt="16px" flexDirection="column">
                    <Typography variant="caption1" fontWeight={500}>
                      {intl.formatMessage(globalMessages.transactionId)}
                    </Typography>
                    <ExplorableHashContainer
                      selectedExplorer={this.props.selectedExplorer}
                      hash={data.txid}
                      light
                      linkType="transaction"
                    >
                      <Typography
                        variant="caption1"
                        color="grayscale.600"
                        className={classnames('txid' /* for tests */)}
                        id={txIdFullInfoBasePart + '-transactionId-text'}
                      >
                        {data.txid}
                      </Typography>
                    </ExplorableHashContainer>
                  </Box>

                  {this.getMetadata(data)}
                </Box>
                <Box display="flex" width="100%" alignItems="flex-end" justifyContent="flex-end">
                  {this.props.memo != null ? (
                    <div className={styles.row}>
                      <h2>
                        {intl.formatMessage(memoMessages.memoLabel)}

                        <button
                          type="button"
                          onClick={onEditMemo.bind(this, data)}
                          className={classnames(
                            styles.editButton,
                            'editMemoButton' // for tests
                          )}
                          id={txIdFullInfoBasePart + '-editMemo-button'}
                        >
                          <div className={styles.editMemoIcon}>
                            <EditSvg />
                          </div>
                        </button>
                      </h2>
                      <span
                        className={classnames(
                          styles.rowData,
                          'memoContent' // for tests
                        )}
                        id={txIdFullInfoBasePart + '-memoContent-text'}
                      >
                        {this.props.memo?.Content}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.row}>
                      <Button
                        variant="tertiary"
                        color="primary"
                        type="button"
                        onClick={onAddMemo.bind(this, data)}
                        className="addMemoButton" // for tests
                        startIcon={<AddMemoSvg />}
                        id={txIdFullInfoBasePart + '-addMemo-button'}
                      >
                        <Typography variant="button2" fontWeight={500}>
                          {intl.formatMessage(memoMessages.addMemo)}
                        </Typography>
                      </Button>
                    </div>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  generateAddressButton: string => ?Node = address => {
    const { intl } = this.context;
    const addressInfo = this.props.addressLookup(address);
    if (addressInfo == null) {
      return (
        <div className={classnames([styles.status, styles.typeAddress])}>
          {intl.formatMessage(globalMessages.processingLabel)}
        </div>
      );
    }
    return (
      <Box
        type="button"
        sx={{
          bgcolor: 'primary.100',
          color: 'primary.600',
          textTransform: 'capitalize',
          cursor: 'pointer',
          borderRadius: '20px',
          px: '8px',
          py: '4px',
        }}
        onClick={addressInfo.goToRoute}
      >
        <Typography variant="caption1">{addressInfo.name}</Typography>
      </Box>
    );
  };

  shelleyCertificateToText: ($ReadOnly<CertificateRow>) => string = certificate => {
    const { intl } = this.context;
    const kind = certificate.Kind;
    return RustModule.WasmScope(Scope => {
      switch (kind) {
        case Scope.WalletV4.CertificateKind.StakeRegistration:
          return intl.formatMessage(shelleyCertificateKinds.StakeRegistration);
        case Scope.WalletV4.CertificateKind.StakeDeregistration:
          return intl.formatMessage(shelleyCertificateKinds.StakeDeregistration);
        case Scope.WalletV4.CertificateKind.StakeDelegation:
          return intl.formatMessage(shelleyCertificateKinds.StakeDelegation);
        case Scope.WalletV4.CertificateKind.PoolRegistration:
          return intl.formatMessage(shelleyCertificateKinds.PoolRegistration);
        case Scope.WalletV4.CertificateKind.PoolRetirement:
          return intl.formatMessage(shelleyCertificateKinds.PoolRetirement);
        case Scope.WalletV4.CertificateKind.GenesisKeyDelegation:
          return intl.formatMessage(shelleyCertificateKinds.GenesisKeyDelegation);
        case Scope.WalletV4.CertificateKind.MoveInstantaneousRewardsCert:
          return intl.formatMessage(shelleyCertificateKinds.MoveInstantaneousRewardsCert);
        case Scope.WalletV4.CertificateKind.VoteDelegation:
          return intl.formatMessage(shelleyCertificateKinds.VoteDelegation);
        case Scope.WalletV4.CertificateKind.StakeAndVoteDelegation:
          return intl.formatMessage(shelleyCertificateKinds.StakeAndVoteDelegation);
        case Scope.WalletV4.CertificateKind.StakeRegistrationAndDelegation:
          return intl.formatMessage(shelleyCertificateKinds.StakeRegistrationAndDelegation);
        case Scope.WalletV4.CertificateKind.VoteRegistrationAndDelegation:
          return intl.formatMessage(shelleyCertificateKinds.VoteRegistrationAndDelegation);
        case Scope.WalletV4.CertificateKind.StakeVoteRegistrationAndDelegation:
          return intl.formatMessage(shelleyCertificateKinds.StakeVoteRegistrationAndDelegation);
        case Scope.WalletV4.CertificateKind.CommitteeHotAuth:
          return intl.formatMessage(shelleyCertificateKinds.CommitteeHotAuth);
        case Scope.WalletV4.CertificateKind.CommitteeColdResign:
          return intl.formatMessage(shelleyCertificateKinds.CommitteeColdResign);
        case Scope.WalletV4.CertificateKind.DRepRegistration:
          return intl.formatMessage(shelleyCertificateKinds.DrepRegistration);
        case Scope.WalletV4.CertificateKind.DRepDeregistration:
          return intl.formatMessage(shelleyCertificateKinds.DrepDeregistration);
        case Scope.WalletV4.CertificateKind.DRepUpdate:
          return intl.formatMessage(shelleyCertificateKinds.DrepUpdate);
        default: {
          throw new Error(`${nameof(this.shelleyCertificateToText)} unexpected kind ${kind}`);
        }
      }
    });
  };

  getWithdrawals: (WalletTransaction, string) => ?Node = (data, txIdFullInfoBasePart) => {
    const { intl } = this.context;
    if (!(data instanceof CardanoShelleyTransaction)) {
      return null;
    }
    if (data.withdrawals.length === 0) {
      return null;
    }
    return (
      <Box className={styles.addressContent} sx={{ borderBottom: '1px solid', borderColor: 'ds.gray_200' }}>
        <div>
          <Box
            sx={{
              display: 'grid',
              gap: '15px',
              gridTemplateColumns: 'minmax(232px, 1fr) 105px 1fr',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: '24px',
            }}
          >
            <Typography variant="caption1">
              {intl.formatMessage(globalMessages.withdrawalsLabel)}:{' '}
              <span style={{ fontWeight: 500 }}>{data.withdrawals.length}</span>
            </Typography>
            <Typography variant="caption1" textAlign="center">
              {intl.formatMessage(messages.addressType)}
            </Typography>
            <Typography variant="caption1" textAlign="center">
              {intl.formatMessage(globalMessages.amountLabel)}
            </Typography>
          </Box>
          <div className={styles.addressList}>
            {data.withdrawals.map((address, addressIndex) => {
              const addressRowId = `${txIdFullInfoBasePart}:withdrawalAddresses:address_${addressIndex}`;
              return this.renderRow({
                kind: 'withdrawal',
                data,
                address,
                addressIndex,
                transform: amount => amount.abs().negated(),
                addressRowId,
              });
            })}
          </div>
        </div>
        <div />
      </Box>
    );
  };

  getCertificate: (WalletTransaction, string) => ?Node = (data, txIdFullInfoBasePart) => {
    const { intl } = this.context;

    const wrapCertificateText = (node, manyCerts) => (
      <Box display="flex" flexDirection="column" gap="8px" px="24px" mt="24px">
        <Typography variant="caption1" fontWeight={500}>
          {manyCerts ? intl.formatMessage(messages.certificatesLabel) : intl.formatMessage(messages.certificateLabel)}
        </Typography>
        <Typography variant="caption1" color="grayscale.600">
          {node}
        </Typography>
      </Box>
    );

    if (data instanceof CardanoShelleyTransaction) {
      if (data.certificates.length === 0) {
        return null;
      }
      const certBlock = data.certificates.reduce((acc, curr, idx) => {
        const certComponentId = `${txIdFullInfoBasePart}-txCertificate_${idx}-text`;
        const newElem = (
          // eslint-disable-next-line react/no-array-index-key
          <span key={idx} id={certComponentId}>
            {acc.length !== 0 ? <br /> : undefined}
            {this.shelleyCertificateToText(curr.certificate)}
          </span>
        );
        acc.push(newElem);
        return acc;
      }, ([]: Array<Node>));
      return wrapCertificateText(certBlock, data.certificates.length > 1);
    }
  };

  getMetadata: WalletTransaction => ?Node = data => {
    const { intl } = this.context;

    if (data instanceof CardanoShelleyTransaction && data.metadata != null) {
      let metadata;
      if (typeof data.metadata === 'string') {
        let jsonData = null;

        try {
          jsonData = parseMetadata(data.metadata);
        } catch (error) {
          // try to parse schema using detailed conversion if advanced user
          if (this.props.complexityLevel === ComplexityLevels.Advanced) {
            try {
              jsonData = parseMetadataDetailed(data.metadata);
            } catch (errDetailed) {
              // discard error
              // can not parse metadata as json
              // show the metadata hex as is
            }
          }
          // do nothing for simple user
        }
        if (jsonData !== null) {
          metadata = <CodeBlock code={jsonData} />;
        } else {
          metadata = <span>0x{data.metadata}</span>;
        }
      } else {
        metadata = <CodeBlock code={<pre>{JSON.stringify(data.metadata, null, 2)} </pre>} />;
      }
      return (
        <div className={styles.row}>
          <h2>{intl.formatMessage(messages.transactionMetadata)}</h2>

          <Typography component="div" className={styles.rowData}>{metadata}</Typography>
        </div>
      );
    }
    return null;
  };
}

const icons = {
  send: SendIcon,
  receive: ReceiveIcon,
  reward: RewardIcon,
  error: ErrorIcon,
  stake: StakeIcon,
};

const TypeIcon = ({ type }) => {
  const Icon = icons[type];
  return <Box sx={{ width: 40, height: 40 }}>{Icon && <Icon />}</Box>;
};
