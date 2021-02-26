// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import type {
  $npm$ReactIntl$IntlFormat,
} from 'react-intl';
import moment from 'moment';
import classnames from 'classnames';
import styles from './Transaction.scss';
import AddMemoSvg from '../../../assets/images/add-memo.inline.svg';
import EditSvg from '../../../assets/images/edit.inline.svg';
import WalletTransaction from '../../../domain/WalletTransaction';
import JormungandrTransaction from '../../../domain/JormungandrTransaction';
import CardanoShelleyTransaction from '../../../domain/CardanoShelleyTransaction';
import globalMessages, { memoMessages, } from '../../../i18n/global-messages';
import type { TransactionDirectionType, } from '../../../api/ada/transactions/types';
import { transactionTypes } from '../../../api/ada/transactions/types';
import type { AssuranceLevel } from '../../../types/transactionAssuranceTypes';
import { Logger } from '../../../utils/logging';
import ExpandArrow from '../../../assets/images/expand-arrow-grey.inline.svg';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { TxStatusCodes, } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { TxStatusCodesType, } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { CertificateRow, TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { splitAmount, truncateAddressShort, truncateToken } from '../../../utils/formatters';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import CopyableAddress from '../../widgets/CopyableAddress';
import type { Notification } from '../../../types/notificationType';
import { genAddressLookup } from '../../../stores/stateless/addressStores';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import type {
  TokenLookupKey, TokenEntry,
} from '../../../api/common/lib/MultiToken';
import { getTokenName, getTokenIdentifierIfExists } from '../../../stores/stateless/tokenHelpers';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { parseMetadata, parseMetadataDetailed } from '../../../api/ada/lib/storage/bridge/metadataUtils';
import CodeBlock from '../../widgets/CodeBlock';
import BigNumber from 'bignumber.js';
import { ComplexityLevels } from '../../../types/complexityLevelType';
import type { ComplexityLevelType } from '../../../types/complexityLevelType';

const messages = defineMessages({
  type: {
    id: 'wallet.transaction.type',
    defaultMessage: '!!!{currency} transaction',
  },
  exchange: {
    id: 'wallet.transaction.type.exchange',
    defaultMessage: '!!!Exchange',
  },
  assuranceLevel: {
    id: 'wallet.transaction.assuranceLevel',
    defaultMessage: '!!!Transaction assurance level',
  },
  confirmations: {
    id: 'wallet.transaction.confirmations',
    defaultMessage: '!!!confirmations',
  },
  conversionRate: {
    id: 'wallet.transaction.conversion.rate',
    defaultMessage: '!!!Conversion rate',
  },
  sent: {
    id: 'wallet.transaction.sent',
    defaultMessage: '!!!{currency} sent',
  },
  received: {
    id: 'wallet.transaction.received',
    defaultMessage: '!!!{currency} received',
  },
  intrawallet: {
    id: 'wallet.transaction.type.intrawallet',
    defaultMessage: '!!!{currency} intrawallet transaction',
  },
  multiparty: {
    id: 'wallet.transaction.type.multiparty',
    defaultMessage: '!!!{currency} multiparty transaction',
  },
  fromAddress: {
    id: 'wallet.transaction.address.from',
    defaultMessage: '!!!From address',
  },
  fromAddresses: {
    id: 'wallet.transaction.addresses.from',
    defaultMessage: '!!!From addresses',
  },
  toAddress: {
    id: 'wallet.transaction.address.to',
    defaultMessage: '!!!To address',
  },
  addressType: {
    id: 'wallet.transaction.address.type',
    defaultMessage: '!!!Address Type',
  },
  toAddresses: {
    id: 'wallet.transaction.addresses.to',
    defaultMessage: '!!!To addresses',
  },
  certificateLabel: {
    id: 'wallet.transaction.certificateLabel',
    defaultMessage: '!!!Certificate',
  },
  certificatesLabel: {
    id: 'wallet.transaction.certificatesLabel',
    defaultMessage: '!!!Certificates',
  },
  transactionAmount: {
    id: 'wallet.transaction.transactionAmount',
    defaultMessage: '!!!Transaction amount',
  },
  transactionMetadata: {
    id: 'wallet.transaction.transactionMetadata',
    defaultMessage: '!!!Transaction Metadata',
  },
});

const jormungandrCertificateKinds = defineMessages({
  PoolRegistration: {
    id: 'wallet.transaction.certificate.PoolRegistration',
    defaultMessage: '!!!Pool registration',
  },
  PoolUpdate: {
    id: 'wallet.transaction.certificate.PoolUpdate',
    defaultMessage: '!!!Pool update',
  },
  PoolRetirement: {
    id: 'wallet.transaction.certificate.PoolRetirement',
    defaultMessage: '!!!Pool retirement',
  },
  StakeDelegation: {
    id: 'wallet.transaction.certificate.StakeDelegation',
    defaultMessage: '!!!Stake delegation',
  },
  OwnerStakeDelegation: {
    id: 'wallet.transaction.certificate.OwnerStakeDelegation',
    defaultMessage: '!!!Owner stake delegation',
  },
});

const shelleyCertificateKinds = {
  PoolRegistration: jormungandrCertificateKinds.PoolRegistration,
  PoolRetirement: jormungandrCertificateKinds.PoolRetirement,
  StakeDelegation: jormungandrCertificateKinds.StakeDelegation,
  StakeDeregistration: globalMessages.StakeDeregistration,
  ...defineMessages({
    StakeRegistration: {
      id: 'wallet.transaction.certificate.StakeRegistration',
      defaultMessage: '!!!Staking key registration',
    },
    GenesisKeyDelegation: {
      id: 'wallet.transaction.certificate.GenesisKeyDelegation',
      defaultMessage: '!!!Genesis key delegation',
    },
    MoveInstantaneousRewardsCert: {
      id: 'wallet.transaction.certificate.MoveInstantaneousRewardsCert',
      defaultMessage: '!!!Manually-initiated reward payout',
    },
  }),
};


const assuranceLevelTranslations = defineMessages({
  low: {
    id: 'wallet.transaction.assuranceLevel.low',
    defaultMessage: '!!!low',
  },
  medium: {
    id: 'wallet.transaction.assuranceLevel.medium',
    defaultMessage: '!!!medium',
  },
  high: {
    id: 'wallet.transaction.assuranceLevel.high',
    defaultMessage: '!!!high',
  },
});

const stateTranslations = defineMessages({
  pending: {
    id: 'wallet.transaction.state.pending',
    defaultMessage: '!!!pending',
  },
  failed: {
    id: 'wallet.transaction.state.failed',
    defaultMessage: '!!!failed',
  },
});

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
  +getCurrentPrice: (from: string, to: string) => ?number,
  +addressLookup: ReturnType<typeof genAddressLookup>,
  +onCopyAddressTooltip: (string, string) => void,
  +notification: ?Notification,
  +addressToDisplayString: string => string,
  +getTokenInfo: Inexact<TokenLookupKey> => $ReadOnly<TokenRow>,
  +complexityLevel: ?ComplexityLevelType,
|};

type State = {|
  isExpanded: boolean,
|};

@observer
export default class Transaction extends Component<Props, State> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    isExpanded: false
  };

  toggleDetails: void => void = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  getTxTypeMsg(
    intl: $npm$ReactIntl$IntlFormat,
    currency: string,
    type: TransactionDirectionType
  ): string {
    if (type === transactionTypes.EXPEND) {
      return intl.formatMessage(messages.sent, { currency });
    }
    if (type === transactionTypes.INCOME) {
      return intl.formatMessage(messages.received, { currency });
    }
    if (type === transactionTypes.SELF) {
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
  ): string {
    if (state === TxStatusCodes.IN_BLOCK) {
      return intl.formatMessage(assuranceLevelTranslations[assuranceLevel]);
    }
    if (state === TxStatusCodes.PENDING) {
      return intl.formatMessage(stateTranslations.pending);
    }
    if (state < 0) {
      return intl.formatMessage(stateTranslations.failed);
    }
    throw new Error(`${nameof(this.getStatusString)} unexpected state ` + state);
  }

  renderAmountDisplay: {|
    entry: TokenEntry,
  |} => Node = (request) => {
    if (this.props.shouldHideBalance) {
      return (<span>{hiddenAmount}</span>);
    }
    const tokenInfo = this.props.getTokenInfo(request.entry);
    const shiftedAmount = request.entry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(
        request.entry.identifier,
        currency
      );
      if (price != null) {
        return (
          <>
            { calculateAndFormatValue(shiftedAmount, price) + ' ' + currency }
            <div className={styles.amountSmall}>
              {shiftedAmount.toString()} {getTokenName(tokenInfo)}
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
      ? beforeDecimalRewards
      : '+' + beforeDecimalRewards;

    return (
      <>
        {adjustedBefore}
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
      </>
    );
  }

  renderFeeDisplay: {|
    amount: MultiToken,
    type: TransactionDirectionType,
  |} => Node = (request) => {
    if (this.props.shouldHideBalance) {
      return (<span>{hiddenAmount}</span>);
    }
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    if (this.props.unitOfAccountSetting.enabled === true) {
      const { currency } = this.props.unitOfAccountSetting;
      const price = this.props.getCurrentPrice(
        defaultEntry.identifier,
        currency
      );
      if (price != null) {
        return (
          <>
            { calculateAndFormatValue(shiftedAmount.abs(), price) + ' ' + currency }
            <div className={styles.amountSmall}>
              {shiftedAmount.abs().toString()} {getTokenName(tokenInfo)}
            </div>
          </>
        );
      }
    }
    if (request.type === transactionTypes.INCOME) {
      return (<span>-</span>);
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
      shiftedAmount.abs(),
      tokenInfo.Metadata.numberOfDecimals
    );

    return (
      <>
        {beforeDecimalRewards}
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
      </>
    );
  }

  getTicker: TokenEntry => string = tokenEntry => {
    if (this.props.unitOfAccountSetting.enabled === true) {
      return this.props.unitOfAccountSetting.currency;
    }
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    return truncateToken(getTokenName(tokenInfo));
  };

  getFingerprint: TokenEntry => string | void = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    if (tokenInfo.Metadata.type === 'Cardano') {
      return getTokenIdentifierIfExists(tokenInfo);
    }
    return undefined;
  }

  renderRow: {|
    kind: string,
    data: WalletTransaction,
    address: {| address: string, value: MultiToken |},
    addressIndex: number,
    transform?: BigNumber => BigNumber,
  |} => Node = (request) => {
    const notificationElementId = `${request.kind}-address-${request.addressIndex}-${request.data.txid}-copyNotification`;
    const divKey = (identifier) => `${request.data.txid}-${request.kind}-${request.address.address}-${request.addressIndex}-${identifier}`;
    const renderAmount = (entry) => {
      const fingerprint = this.getFingerprint(entry);
      return (
        <div className={styles.fee}>
          {this.renderAmountDisplay({
            entry: {
              ...entry,
              amount: request.transform
                ? request.transform(entry.amount)
                : entry.amount,
            },
          })}
          {' '}
          { fingerprint !== undefined ? (
            <ExplorableHashContainer
              selectedExplorer={this.props.selectedExplorer}
              hash={fingerprint}
              light
              linkType="token"
              ><span className={styles.rowData}>{this.getTicker(entry)}</span></ExplorableHashContainer>  
          ): this.getTicker(entry)}
          
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
          onCopyAddress={
            () => this.props.onCopyAddressTooltip(request.address.address, notificationElementId)
          }
          notification={this.props.notification}
        >
          <ExplorableHashContainer
            selectedExplorer={this.props.selectedExplorer}
            hash={this.props.addressToDisplayString(request.address.address)}
            light
            linkType="address"
          >
            <span className={classnames([styles.rowData, styles.hash])}>
              {truncateAddressShort(
                this.props.addressToDisplayString(request.address.address)
              )}
            </span>
          </ExplorableHashContainer>
        </CopyableAddress>
        {this.generateAddressButton(request.address.address)}
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
  }

  render(): Node {
    const data = this.props.data;
    const {
      isLastInList,
      state,
      assuranceLevel,
      onAddMemo,
      onEditMemo,
    } = this.props;
    const { isExpanded } = this.state;
    const { intl } = this.context;
    const isFailedTransaction = state < 0;
    const isPendingTransaction = state === TxStatusCodes.PENDING;

    const componentStyles = classnames([
      styles.component,
      isFailedTransaction ? styles.failed : null,
      isPendingTransaction ? styles.pending : null,
    ]);

    const contentStyles = classnames([
      styles.content,
      isLastInList ? styles.last : styles.notLast,
      isExpanded ? styles.shadow : null,
    ]);

    const detailsStyles = classnames([
      styles.details,
      isExpanded ? styles.expanded : styles.closed
    ]);

    const labelOkClasses = classnames([
      styles.status,
      styles[assuranceLevel]
    ]);

    const labelClasses = classnames([
      styles.status,
      isFailedTransaction ? styles.failedLabel : '',
      isPendingTransaction ? styles.pendingLabel : '',
    ]);

    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const status = this.getStatusString(intl, state, assuranceLevel);

    return (
      <div className={componentStyles}>

        {/* ==== Clickable Header -> toggles details ==== */}
        <div className={styles.toggler} onClick={this.toggleDetails.bind(this)} role="presentation" aria-hidden>
          <div className={styles.togglerContent}>
            <div className={styles.header}>
              <div className={styles.time}>
                {moment(data.date).format('hh:mm:ss A')}
              </div>
              <div className={styles.type}>
                {this.getTxTypeMsg(
                  intl,
                  this.getTicker(data.amount.getDefaultEntry()),
                  data.type
                )}
              </div>
              {state === TxStatusCodes.IN_BLOCK ? (
                <div className={labelOkClasses}>{status}</div>
              ) : (
                <div className={labelClasses}>
                  {status}
                </div>
              )}
              <div className={classnames([styles.currency, styles.fee])}>
                {this.renderFeeDisplay({
                  amount: data.fee,
                  type: data.type,
                })}
              </div>
              <div className={classnames([styles.currency, styles.amount])}>
                {this.renderAmountDisplay({
                  entry: data.amount.getDefaultEntry(),
                })}
              </div>
            </div>
            <div className={styles.expandArrowBox}>
              <span className={arrowClasses}><ExpandArrow /></span>
            </div>
          </div>
        </div>

        {/* ==== Toggleable Transaction Details ==== */}
        <div className={contentStyles}>
          <div className={detailsStyles}>
            { /* converting assets is not implemented but we may use it in the future for tokens */}
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
                      {intl.formatMessage(messages.fromAddresses)}:
                      <span className={styles.addressCount}>
                        {data.addresses.from.length}
                      </span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.fee}>
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </h2>
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
                    })
                    }
                  </div>
                </div>
                <div>
                  <div className={styles.addressHeader}>
                    <h2>
                      {intl.formatMessage(messages.toAddresses)}:
                      <span className={styles.addressCount}>{data.addresses.to.length}</span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.fee}>
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </h2>
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

              {(
                state === TxStatusCodes.IN_BLOCK &&
                this.props.numberOfConfirmations != null
              ) && (
                <div className={styles.row}>
                  <h2>{intl.formatMessage(messages.assuranceLevel)}</h2>
                  <span className={styles.rowData}>
                    <span className={styles.assuranceLevel}>{status}</span>
                    . <span className="confirmationCount">{this.props.numberOfConfirmations}</span> {intl.formatMessage(messages.confirmations)}.
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
                <span className={classnames([styles.rowData, styles.hash, 'txid'/* for tests */])}>
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
                  <span className={classnames(
                    styles.rowData,
                    'memoContent', // for tests
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
        </div>

      </div>
    );
  }

  generateAddressButton: string => ?Node = (address) => {
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
      <button type="button" className={classnames([styles.status, styles.typeAddress])} onClick={addressInfo.goToRoute}>
        {addressInfo.name}
      </button>
    );
  }

  jormungandrCertificateToText: $ReadOnly<CertificateRow> => string = (certificate) => {
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
  }

  shelleyCertificateToText: $ReadOnly<CertificateRow> => string = (certificate) => {
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
  }

  getWithdrawals: WalletTransaction => ?Node = (data) => {
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
              <span className={styles.addressCount}>
                {data.withdrawals.length}
              </span>
            </h2>
            <h2>{intl.formatMessage(messages.addressType)}</h2>
            <h2 className={styles.fee}>
              {intl.formatMessage(globalMessages.amountLabel)}
            </h2>
          </div>
          <div className={styles.addressList}>
            {data.withdrawals.map((address, addressIndex) => {
              return this.renderRow({
                kind: 'withdrawal',
                data,
                address,
                addressIndex,
              });
            })
            }
          </div>
        </div>
        <div />
      </div>
    );
  }

  getCertificate: WalletTransaction => ?Node = (data) => {
    const { intl } = this.context;

    const wrapCertificateText = (node, manyCerts) => (
      <>
        <h2>
          {manyCerts
            ? intl.formatMessage(messages.certificatesLabel)
            : intl.formatMessage(messages.certificateLabel)
          }
        </h2>
        <span className={styles.rowData}>
          {node}
        </span>
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
      const certBlock = data.certificates.reduce(
        (acc, curr, idx) => {
          const newElem = (
            // eslint-disable-next-line react/no-array-index-key
            <span key={idx}>
              {acc.length !== 0 ? (<br />) : undefined}
              {this.shelleyCertificateToText(curr.certificate)}
            </span>
          );
          acc.push(newElem);
          return acc;
        },
        ([]: Array<Node>)
      );
      return wrapCertificateText(
        certBlock,
        data.certificates.length > 1
      );
    }
  }

  getMetadata: WalletTransaction => ? Node = (data) => {
    const { intl } = this.context;

    if (data instanceof CardanoShelleyTransaction && data.metadata !== null) {
      let jsonData = null;

      try {
        jsonData = parseMetadata(data.metadata);
      } catch (error) {
        // try to parse schema using detailed conversion if advanced user
        if(this.props.complexityLevel === ComplexityLevels.Advanced){
          try {
            jsonData = parseMetadataDetailed(data.metadata)
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
            {jsonData !== null ? (
              <CodeBlock code={jsonData} />)
              : (<span>0x{data.metadata}</span>)
            }
          </span>
        </div>
      )
    }
    return null;
  }
}
