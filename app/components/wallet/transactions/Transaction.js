// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import type {
  $npm$ReactIntl$IntlFormat,
  $npm$ReactIntl$MessageDescriptor,
} from 'react-intl';
import moment from 'moment';
import classnames from 'classnames';
import { uniq } from 'lodash';
import styles from './Transaction.scss';
import AdaSymbol from '../../../assets/images/ada-symbol.inline.svg';
import AddMemoSvg from '../../../assets/images/add-memo.inline.svg';
import EditSvg from '../../../assets/images/edit.inline.svg';
import WalletTransaction from '../../../domain/WalletTransaction';
import globalMessages, { memoMessages, environmentSpecificMessages } from '../../../i18n/global-messages';
import type { TransactionDirectionType, } from '../../../api/ada/transactions/types';
import { transactionTypes } from '../../../api/ada/transactions/types';
import type { AssuranceLevel } from '../../../types/transactionAssuranceTypes';
import environment from '../../../environment';
import { Logger } from '../../../utils/logging';
import ExpandArrow from '../../../assets/images/expand-arrow-grey.inline.svg';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../../domain/Explorer';
import type { PriceDataRow } from '../../../api/ada/lib/storage/database/prices/tables';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { TxStatusCodes, } from '../../../api/ada/lib/storage/database/primitives/enums';
import type { TxStatusCodesType, } from '../../../api/ada/lib/storage/database/primitives/enums';
import { addressToDisplayString } from '../../../api/ada/lib/storage/bridge/utils';
import type { CertificateRow } from '../../../api/ada/lib/storage/database/primitives/tables';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';
import { splitAmount } from '../../../utils/formatters';
import type { TxMemoTableRow } from '../../../api/ada/lib/storage/database/memos/tables';
import CopyableAddress from '../../widgets/CopyableAddress';

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
  transactionAmount: {
    id: 'wallet.transaction.transactionAmount',
    defaultMessage: '!!!Transaction amount',
  },
});

const certificateKinds = defineMessages({
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
  +selectedExplorer: ExplorerType,
  +assuranceLevel: AssuranceLevel,
  +isLastInList: boolean,
  +shouldHideBalance: boolean,
  +onAddMemo: WalletTransaction => void,
  +onEditMemo: WalletTransaction => void,
  +unitOfAccount: void | $ReadOnly<PriceDataRow>,
  +addressLookup: string => void | {|
    goToRoute: void => void,
    displayName: $Exact<$npm$ReactIntl$MessageDescriptor>,
  |},
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
      Logger.error('MULTI type transaction detected.');
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

  truncateString(string: string): string {
    const { length } = string;
    return length > 20 ? `${string.substring(0, 10)}...${string.substring(length - 10)}` : string;
  }

  renderAmountDisplay: {|
    amount: BigNumber,
  |} => Node = (request) => {
    if (this.props.shouldHideBalance) {
      return (<span>******</span>);
    }

    const { unitOfAccount } = this.props;
    if (unitOfAccount != null) {
      return (
        <>
          { calculateAndFormatValue(request.amount, unitOfAccount.Price) + ' ' + unitOfAccount.To }
          <div className={styles.amountSmall}>
            {request.amount.toString()} ADA
          </div>
        </>
      );
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(request.amount);

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
    amount: BigNumber,
    type: TransactionDirectionType,
  |} => Node = (request) => {
    if (this.props.shouldHideBalance) {
      return (<span>******</span>);
    }
    const { unitOfAccount } = this.props;
    if (unitOfAccount != null) {
      return (
        <>
          { calculateAndFormatValue(request.amount.abs(), unitOfAccount.Price) + ' ' + unitOfAccount.To }
          <div className={styles.amountSmall}>
            {request.amount.abs().toString()} ADA
          </div>
        </>
      );
    }
    if (request.type === transactionTypes.INCOME) {
      return (<span>-</span>);
    }
    const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(request.amount.abs());

    return (
      <>
        {beforeDecimalRewards}
        <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
      </>
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

    const currency = intl.formatMessage(environmentSpecificMessages[environment.API].currency);

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
                { this.getTxTypeMsg(intl, currency, data.type) }
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
                  amount: data.amount,
                })}
                {this.props.unitOfAccount == null && (
                  <span className={styles.currencySymbol}><AdaSymbol /></span>
                )}
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
                      <span className={styles.addressCount}>{uniq(data.addresses.from).length}</span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.amount}>
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </h2>
                  </div>
                  <div className={styles.addressList}>
                    {uniq(data.addresses.from).map(address => (
                      <div key={`${data.txid}-from-${address.address}`} className={styles.addressItem}>
                        <ExplorableHashContainer
                          key={`${data.txid}-from-${address.address}`}
                          selectedExplorer={this.props.selectedExplorer}
                          hash={addressToDisplayString(address.address)}
                          light
                          linkType="address"
                        >
                          <div className={classnames([styles.rowData, styles.hash])}>
                            {this.truncateString(addressToDisplayString(address.address))}
                          </div>
                        </ExplorableHashContainer>
                        <div>
                          {this.generateAddressButton(address.address)}
                        </div>
                        <div className={styles.fee}>
                          {this.renderAmountDisplay({ amount: address.value.negated() })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className={styles.addressHeader}>
                    <h2>
                      {intl.formatMessage(messages.toAddresses)}:
                      <span className={styles.addressCount}>{uniq(data.addresses.to).length}</span>
                    </h2>
                    <h2>{intl.formatMessage(messages.addressType)}</h2>
                    <h2 className={styles.amount}>
                      {intl.formatMessage(globalMessages.amountLabel)}
                    </h2>
                  </div>
                  <div className={styles.addressList}>
                    {data.addresses.to.map((address, addressIndex) => (
                      <div // eslint-disable-next-line react/no-array-index-key
                        key={`${data.txid}-to-${address.address}-${addressIndex}`}
                        className={styles.addressItem}
                      >
                        <ExplorableHashContainer
                          selectedExplorer={this.props.selectedExplorer}
                          hash={addressToDisplayString(address.address)}
                          light
                          linkType="address"
                        >
                          <div className={classnames([styles.rowData, styles.hash])}>
                            {this.truncateString(addressToDisplayString(address.address))}
                          </div>
                        </ExplorableHashContainer>
                        <div>
                          {this.generateAddressButton(address.address)}
                        </div>
                        <div className={styles.fee}>
                          {this.renderAmountDisplay({ amount: address.value })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {this.getCertificate(data)}

              {(
                environment.isAdaApi() &&
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
                <span className={classnames([styles.rowData, styles.hash])}>
                  {data.txid}
                </span>
              </ExplorableHashContainer>

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
    if (environment.isProduction()) return undefined;

    const { intl } = this.context;
    const addressInfo = this.props.addressLookup(
      addressToDisplayString(address)
    );
    if (addressInfo != null) {
      return (
        <button type="button" className={classnames([styles.status, styles.typeAddress])} onClick={addressInfo.goToRoute}>
          {intl.formatMessage(addressInfo.displayName)}
        </button>
      );
    }
    return (
      <button type="button" onClick={() => {} /* todo: link to address book */}>
        {intl.formatMessage(globalMessages.addToAddressbookLabel)}
      </button>
    );
  }

  certificateToText: $ReadOnly<CertificateRow> => string = (certificate) => {
    const { intl } = this.context;
    const kind = certificate.Kind;
    switch (kind) {
      case RustModule.WalletV3.CertificateKind.PoolRegistration:
        return intl.formatMessage(certificateKinds.PoolRegistration);
      case RustModule.WalletV3.CertificateKind.PoolUpdate:
        return intl.formatMessage(certificateKinds.PoolUpdate);
      case RustModule.WalletV3.CertificateKind.PoolRetirement:
        return intl.formatMessage(certificateKinds.PoolRetirement);
      case RustModule.WalletV3.CertificateKind.StakeDelegation:
        return intl.formatMessage(certificateKinds.StakeDelegation);
      case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation:
        return intl.formatMessage(certificateKinds.OwnerStakeDelegation);
      default: {
        throw new Error(`${nameof(this.certificateToText)} unexpected kind ${kind}`);
      }
    }
  }

  getCertificate: WalletTransaction => Node = (data) => {
    const { intl } = this.context;
    console.log({data});
    if (data.certificate == null) {
      return (null);
    }
    const certificateText = this.certificateToText(data.certificate.certificate);
    return (
      <>
        <h2>
          {intl.formatMessage(messages.certificateLabel)}
        </h2>
        <span className={styles.rowData}>
          {certificateText}
        </span>
      </>
    );
  }
}
