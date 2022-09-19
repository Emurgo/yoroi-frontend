/* eslint-disable no-nested-ternary */
// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import moment from 'moment';
import classnames from 'classnames';
import styles from './Transaction.scss';
import { ReactComponent as AddMemoSvg }  from '../../../assets/images/add-memo.inline.svg';
import { ReactComponent as EditSvg }  from '../../../assets/images/edit.inline.svg';
import WalletTransaction from '../../../domain/WalletTransaction';
import JormungandrTransaction from '../../../domain/JormungandrTransaction';
import CardanoShelleyTransaction from '../../../domain/CardanoShelleyTransaction';
import globalMessages, { memoMessages } from '../../../i18n/global-messages';
import type { TransactionDirectionType } from '../../../api/ada/transactions/types';
import { transactionTypes } from '../../../api/ada/transactions/types';
import type { AssuranceLevel } from '../../../types/transactionAssuranceTypes';
import { Logger } from '../../../utils/logging';
import { ReactComponent as ExpandArrow }  from '../../../assets/images/expand-arrow-grey.inline.svg';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { TxStatusCodes } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { TxStatusCodesType } from '../../../api/ada/lib/storage/database/primitives/enums';
import type {
  CertificateRow,
  TokenRow,
} from '../../../api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import CopyableAddress from '../../widgets/CopyableAddress';
import type { Notification } from '../../../types/notificationType';
import { genAddressLookup } from '../../../stores/stateless/addressStores';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import type { TokenLookupKey, TokenEntry } from '../../../api/common/lib/MultiToken';
import { getTokenName, getTokenIdentifierIfExists } from '../../../stores/stateless/tokenHelpers';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import {
  parseMetadata,
  parseMetadataDetailed,
} from '../../../api/ada/lib/storage/bridge/metadataUtils';
import CodeBlock from '../../widgets/CodeBlock';
import BigNumber from 'bignumber.js';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import {
  assuranceLevelTranslations,
  jormungandrCertificateKinds,
  shelleyCertificateKinds,
  stateTranslations,
  messages,
} from './Transaction';
import { columnTXStyles } from '../summary/WalletSummaryRevamp';

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
|};

type State = {|
  isExpanded: boolean,
|};

@observer
export default class TransactionRevamp extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isExpanded: false,
  };

  toggleDetails: void => void = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  };

  getTxTypeMsg(intl: $npm$ReactIntl$IntlFormat, currency: string, data: WalletTransaction): string {
    const { type } = data;
    if (type === transactionTypes.EXPEND) {
      return intl.formatMessage(messages.sent, { currency });
    }
    if (type === transactionTypes.INCOME) {
      return intl.formatMessage(messages.received, { currency });
    }
    if (type === transactionTypes.SELF) {
      if (data instanceof CardanoShelleyTransaction) {
        const features = data.getFeatures();
        if (
          (features.includes('Withdrawal') && features.length === 1) ||
          (features.includes('Withdrawal') &&
            features.includes('StakeDeregistration') &&
            features.length === 2)
        ) {
          return intl.formatMessage({ id: 'wallet.transaction.type.rewardWithdrawn' });
        }
        if (features.includes('CatalystVotingRegistration') && features.length === 1) {
          return intl.formatMessage(messages.catalystVotingRegistered);
        }
        if (
          (features.includes('StakeDelegation') && features.length === 1) ||
          (features.includes('StakeDelegation') &&
            features.includes('StakeRegistration') &&
            features.length === 2)
        ) {
          return intl.formatMessage(messages.stakeDelegated);
        }
        if (features.includes('StakeRegistration') && features.length === 1) {
          return intl.formatMessage(messages.stakeKeyRegistered);
        }
      }
      return intl.formatMessage(messages.intrawallet, { currency });
    }
    if (type === transactionTypes.MULTI) {
      // can happen for example in Cardano
      // if you claim a reward from an account doesn't belong to you
      // you have an input to pay the tx fee
      // there is an input you don't own (the withdrawal)
      // you have an output to receive change + withdrawal amount
      return intl.formatMessage(messages.multiparty, { currency });
    }
    // unused
    if (type === transactionTypes.EXCHANGE) {
      Logger.error('EXCHANGE type transactions not supported');
      return '???';
    }
    Logger.error('Unknown transaction type');
    return '???';
  }

  getStatusString(
    intl: $npm$ReactIntl$IntlFormat,
    state: number,
    assuranceLevel: AssuranceLevel,
    isValid: boolean,
  ): string {
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
  |}) => Node = request => {
    if (this.props.shouldHideBalance) {
      return <span>{hiddenAmount}</span>;
    }
    const tokenInfo = this.props.getTokenInfo(request.entry);
    const shiftedAmount = request.entry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      tokenInfo.Metadata.numberOfDecimals
    );

    // we may need to explicitly add + for positive values
    const adjustedBefore = beforeDecimalRewards.startsWith('-')
      ? beforeDecimalRewards
      : '+' + beforeDecimalRewards;

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
      if (this.props.shouldHideBalance) {
        return (
          <>
            <span>{hiddenAmount}</span>
            {currency}
          </>
        );
      }

      const tokenInfo = this.props.getTokenInfo(request.entry);
      const shiftedAmount = request.entry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      if (currency == null) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      const price = this.props.getHistoricalPrice(
        ticker,
        currency,
        request.timestamp,
      );
      let fiatDisplay;
      if (price != null) {
        const amount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = amount.split('.');
        const beforeDecimalWithSign = beforeDecimal.startsWith('-')
          ? beforeDecimal
          : '+' + beforeDecimal;
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
        <>
          {fiatDisplay}&nbsp;{currency}
          <Typography>
            {this.renderAmountDisplay({ entry: request.entry })}
            {' '}
            {this.getTicker(request.entry)}
          </Typography>
        </>
      );
    }

    return (
      <>
        {this.renderAmountDisplay({ entry: request.entry })}
        {' '}
        {this.getTicker(request.entry)}
      </>
    );
  }

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

    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount,
      tokenInfo.Metadata.numberOfDecimals
    );

    if (this.props.unitOfAccountSetting.enabled) {
      const { currency } = this.props.unitOfAccountSetting;
      if (currency == null) {
        throw new Error(`unexpected unit of account ${String(currency)}`);
      }
      const ticker = tokenInfo.Metadata.ticker;
      if (ticker == null) {
        throw new Error('unexpected main token type');
      }
      const price = this.props.getHistoricalPrice(
        ticker,
        currency,
        request.timestamp,
      );

      let fiatDisplay;
      if (price != null) {
        const amount = calculateAndFormatValue(shiftedAmount, price);
        const [beforeDecimal, afterDecimal] = amount.split('.');
        fiatDisplay = (
          <>
            {beforeDecimal}
            {afterDecimal && (
              <span className={styles.afterDecimal}>
                .{afterDecimal}
              </span>
            )}
          </>
        );
      } else {
        fiatDisplay = '-';
      }
      return (
        <>
          {fiatDisplay}&nbsp;{currency}
          <Typography>
            {beforeDecimalRewards}
            <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
            {' '}
            {this.getTicker(defaultEntry)}
          </Typography>
        </>
      );
    }

    return (
      <>
        {beforeDecimalRewards}
        <Typography as="span" fontSize="inherit">
          {afterDecimalRewards}
        </Typography>
      </>
    );
  };

  getTicker: TokenEntry => string = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    return truncateToken(getTokenName(tokenInfo));
  };

  getFingerprint: TokenEntry => string | void = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    if (tokenInfo.Metadata.type === 'Cardano') {
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
          {this.renderAmountDisplay({ entry })}{' '}{this.getTicker(entry)}
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
        {request.assets.length}
        {' '}
        {this.context.intl.formatMessage(globalMessages.assets)}
      </div>
    );
  };

  renderRow: ({|
    kind: string,
    data: WalletTransaction,
    address: {| address: string, value: MultiToken |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |}) => Node = request => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-${request.data.txid}-copyNotification`;
    const divKey = identifier =>
      `${request.data.txid}-${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = entry => {
      const fingerprint = this.getFingerprint(entry);
      return (
        <div className={styles.fee}>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform ? request.transform(entry.amount) : entry.amount,
            },
          })}{' '}
          {fingerprint !== undefined ? (
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={fingerprint}
              light
              linkType="token"
            >
              <span className={styles.rowData}>{this.getTicker(entry)}</span>
            </ExplorableHashContainer>
          ) : (
            this.getTicker(entry)
          )}
        </div>
      );
    };

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div
        key={divKey(request.address.value.getDefaultEntry().identifier)}
        className={styles.addressItem}
      >
        <CopyableAddress
          hash={this.props.addressToDisplayString(request.address.address)}
          elementId={notificationElementId}
          onCopyAddress={() =>
            this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
          placementTooltip="bottom-start"
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <span className={classnames([styles.rowData, styles.hash])}>
              {truncateAddressShort(this.props.addressToDisplayString(request.address.address))}
            </span>
          </ExplorableHashContainer>
        </CopyableAddress>
        {this.generateAddressButton(request.address.address)}
        <Typography variant="body2" color="var(--yoroi-palette-gray-900)">
          {renderAmount(request.address.value.getDefaultEntry())}
        </Typography>
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

  render(): Node {
    const data = this.props.data;
    const { state, assuranceLevel, onAddMemo, onEditMemo } = this.props;
    const { isExpanded } = this.state;
    const { intl } = this.context;
    const isSubmittedTransaction = state === TxStatusCodes.SUBMITTED;
    const isFailedTransaction = (state < 0) && !isSubmittedTransaction;
    const isPendingTransaction = (state === TxStatusCodes.PENDING) || isSubmittedTransaction;
    const isValidTransaction = (data instanceof CardanoShelleyTransaction) ?
      data.isValid :
      true;

    const contentStyles = classnames([styles.content, isExpanded ? styles.shadow : null]);

    const detailsStyles = classnames([
      styles.details,
      isExpanded ? styles.expanded : styles.closed,
    ]);

    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const status = this.getStatusString(intl, state, assuranceLevel, isValidTransaction);

    return (
      <Box className={styles.component}>
        {/* ==== Clickable Header -> toggles details ==== */}
        <Box
          sx={{ padding: '20px 0', borderBottom: '1px solid var(--yoroi-palette-gray-200)' }}
          onClick={this.toggleDetails.bind(this)}
          role="presentation"
          aria-hidden
        >
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
            >
              <Box sx={columnTXStyles.transactionType}>
                <Typography
                  variant="body1"
                  color={
                    isPendingTransaction
                      ? 'var(--yoroi-palette-gray-400)'
                      : 'var(--yoroi-palette-gray-900)'
                  }
                >
                  {this.getTxTypeMsg(intl, this.getTicker(data.amount.getDefaultEntry()), data)}
                </Typography>
                <Typography
                  variant="body3"
                  color={
                    isPendingTransaction
                      ? 'var(--yoroi-palette-gray-400)'
                      : 'var(--yoroi-palette-gray-600)'
                  }
                >
                  {moment(data.date).format('hh:mm A')}
                </Typography>
              </Box>
              <Box sx={columnTXStyles.status}>
                {state === TxStatusCodes.IN_BLOCK ? (
                  <Typography
                    sx={{
                      color: isPendingTransaction
                        ? 'var(--yoroi-palette-gray-400)'
                        : 'var(--yoroi-palette-gray-900)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status}
                  </Typography>
                ) : (
                  <Typography
                    sx={{
                      color: isFailedTransaction
                        ? 'var(--yoroi-palette-error-100)'
                        : isPendingTransaction
                        ? 'var(--yoroi-palette-gray-400)'
                        : 'var(--yoroi-palette-gray-900)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body1"
                color="var(--yoroi-palette-gray-900)"
                sx={columnTXStyles.fee}
              >
                {this.renderFeeDisplay({
                  amount: data.fee,
                  type: data.type,
                  timestamp: data.date.valueOf(),
                })}
              </Typography>
              <Box sx={columnTXStyles.amount}>
                <Typography variant="body1" fontWeight="500" color="var(--yoroi-palette-gray-900)">
                  {this.renderAmountWithUnitOfAccount({
                    entry: data.amount.getDefaultEntry(),
                    timestamp: data.date.valueOf(),
                  })}
                </Typography>
                {this.renderAssets({ assets: data.amount.nonDefaultEntries() })}
              </Box>
            </Box>
            <div className={styles.expandArrowBox}>
              <span className={arrowClasses}>
                <ExpandArrow />
              </span>
            </div>
          </Box>
        </Box>

        {/* ==== Toggleable Transaction Details ==== */}
        <Box className={contentStyles} sx={{ overflowX: 'overlay' }}>
          <div className={detailsStyles}>
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
            <div>
              <div className={styles.addressContent}>
                <div>
                  <div className={styles.addressHeader}>
                    <h2>
                      {intl.formatMessage(globalMessages.fromAddresses)}:
                      <span className={styles.addressCount}>{data.addresses.from.length}</span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.fee}>{intl.formatMessage(globalMessages.amountLabel)}</h2>
                  </div>
                  <div className={styles.addressList}>
                    {data.addresses.from.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'in',
                        data,
                        address,
                        addressIndex,
                        transform: amount => amount.abs().negated(), // ensure it shows as negative
                      });
                    })}
                  </div>
                </div>
                <div>
                  <div className={styles.addressHeader}>
                    <h2>
                      {intl.formatMessage(globalMessages.toAddresses)}:
                      <span className={styles.addressCount}>{data.addresses.to.length}</span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.fee}>{intl.formatMessage(globalMessages.amountLabel)}</h2>
                  </div>
                  <div className={styles.addressList}>
                    {data.addresses.to.map((address, addressIndex) => {
                      return this.renderRow({
                        kind: 'out',
                        data,
                        address,
                        addressIndex,
                      });
                    })}
                  </div>
                </div>
              </div>
              {this.getWithdrawals(data)}
              {this.getCertificate(data)}

              {state === TxStatusCodes.IN_BLOCK && this.props.numberOfConfirmations != null && (
                <div className={styles.row}>
                  <h2>{intl.formatMessage(messages.assuranceLevel)}</h2>
                  <span className={styles.rowData}>
                    <span className={styles.assuranceLevel}>{status}</span>.{' '}
                    <span className="confirmationCount">{this.props.numberOfConfirmations}</span>{' '}
                    {intl.formatMessage(messages.confirmations)}.
                  </span>
                </div>
              )}

              <h2>{intl.formatMessage(globalMessages.transactionId)}</h2>
              <ExplorableHashContainer
                selectedExplorer={this.props.selectedExplorer}
                hash={data.txid}
                light
                linkType="transaction"
              >
                <span className={classnames([styles.rowData, styles.hash, 'txid' /* for tests */])}>
                  {data.txid}
                </span>
              </ExplorableHashContainer>

              {this.getMetadata(data)}
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
                  >
                    {this.props.memo?.Content}
                  </span>
                </div>
              ) : (
                <div className={styles.row}>
                  <div className={styles.memoActionItemBlock}>
                    <button
                      type="button"
                      onClick={onAddMemo.bind(this, data)}
                      className="addMemoButton" // for tests
                    >
                      <div>
                        <span className={styles.addMemoIcon}>
                          <AddMemoSvg />
                        </span>
                        <span>{intl.formatMessage(memoMessages.addMemo)}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
      <button
        type="button"
        className={classnames([styles.status, styles.typeAddress])}
        onClick={addressInfo.goToRoute}
      >
        {addressInfo.name}
      </button>
    );
  };

  jormungandrCertificateToText: ($ReadOnly<CertificateRow>) => string = certificate => {
    const { intl } = this.context;
    const kind = certificate.Kind;
    switch (kind) {
      case RustModule.WalletV3.CertificateKind.PoolRegistration:
        return intl.formatMessage(jormungandrCertificateKinds.PoolRegistration);
      case RustModule.WalletV3.CertificateKind.PoolUpdate:
        return intl.formatMessage(jormungandrCertificateKinds.PoolUpdate);
      case RustModule.WalletV3.CertificateKind.PoolRetirement:
        return intl.formatMessage(jormungandrCertificateKinds.PoolRetirement);
      case RustModule.WalletV3.CertificateKind.StakeDelegation:
        return intl.formatMessage(jormungandrCertificateKinds.StakeDelegation);
      case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation:
        return intl.formatMessage(jormungandrCertificateKinds.OwnerStakeDelegation);
      default: {
        throw new Error(`${nameof(this.jormungandrCertificateToText)} unexpected kind ${kind}`);
      }
    }
  };

  shelleyCertificateToText: ($ReadOnly<CertificateRow>) => string = certificate => {
    const { intl } = this.context;
    const kind = certificate.Kind;
    switch (kind) {
      case RustModule.WalletV4.CertificateKind.StakeRegistration:
        return intl.formatMessage(shelleyCertificateKinds.StakeRegistration);
      case RustModule.WalletV4.CertificateKind.StakeDeregistration:
        return intl.formatMessage(shelleyCertificateKinds.StakeDeregistration);
      case RustModule.WalletV4.CertificateKind.StakeDelegation:
        return intl.formatMessage(shelleyCertificateKinds.StakeDelegation);
      case RustModule.WalletV4.CertificateKind.PoolRegistration:
        return intl.formatMessage(shelleyCertificateKinds.PoolRegistration);
      case RustModule.WalletV4.CertificateKind.PoolRetirement:
        return intl.formatMessage(shelleyCertificateKinds.PoolRetirement);
      case RustModule.WalletV4.CertificateKind.GenesisKeyDelegation:
        return intl.formatMessage(shelleyCertificateKinds.GenesisKeyDelegation);
      case RustModule.WalletV4.CertificateKind.MoveInstantaneousRewardsCert:
        return intl.formatMessage(shelleyCertificateKinds.MoveInstantaneousRewardsCert);
      default: {
        throw new Error(`${nameof(this.shelleyCertificateToText)} unexpected kind ${kind}`);
      }
    }
  };

  getWithdrawals: WalletTransaction => ?Node = data => {
    const { intl } = this.context;
    if (!(data instanceof CardanoShelleyTransaction)) {
      return null;
    }
    if (data.withdrawals.length === 0) {
      return null;
    }
    return (
      <div className={styles.addressContent}>
        <div>
          <div className={styles.addressHeader}>
            <h2>
              {intl.formatMessage(globalMessages.withdrawalsLabel)}:
              <span className={styles.addressCount}>{data.withdrawals.length}</span>
            </h2>
            <h2>{intl.formatMessage(messages.addressType)}</h2>
            <h2 className={styles.fee}>{intl.formatMessage(globalMessages.amountLabel)}</h2>
          </div>
          <div className={styles.addressList}>
            {data.withdrawals.map((address, addressIndex) => {
              return this.renderRow({
                kind: 'withdrawal',
                data,
                address,
                addressIndex,
              });
            })}
          </div>
        </div>
        <div />
      </div>
    );
  };

  getCertificate: WalletTransaction => ?Node = data => {
    const { intl } = this.context;

    const wrapCertificateText = (node, manyCerts) => (
      <>
        <h2>
          {manyCerts
            ? intl.formatMessage(messages.certificatesLabel)
            : intl.formatMessage(messages.certificateLabel)}
        </h2>
        <span className={styles.rowData}>{node}</span>
      </>
    );
    if (data instanceof JormungandrTransaction) {
      if (data.certificates.length === 0) {
        return null;
      }
      return wrapCertificateText(
        this.jormungandrCertificateToText(data.certificates[0].certificate),
        data.certificates.length > 1
      );
    }
    if (data instanceof CardanoShelleyTransaction) {
      if (data.certificates.length === 0) {
        return null;
      }
      const certBlock = data.certificates.reduce((acc, curr, idx) => {
        const newElem = (
          // eslint-disable-next-line react/no-array-index-key
          <span key={idx}>
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

    if (data instanceof CardanoShelleyTransaction && data.metadata !== null) {
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

      return (
        <div className={styles.row}>
          <h2>{intl.formatMessage(messages.transactionMetadata)}</h2>
          <span className={styles.rowData}>
            {jsonData !== null ? <CodeBlock code={jsonData} /> : <span>0x{data.metadata}</span>}
          </span>
        </div>
      );
    }
    return null;
  };
}
