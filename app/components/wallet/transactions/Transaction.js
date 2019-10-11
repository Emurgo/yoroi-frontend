// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { defineMessages, intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import moment from 'moment';
import SvgInline from 'react-svg-inline';
import classNames from 'classnames';
import { uniq } from 'lodash';
import styles from './Transaction.scss';
import adaSymbol from '../../../assets/images/ada-symbol.inline.svg';
import WalletTransaction from '../../../domain/WalletTransaction';
import { environmentSpecificMessages } from '../../../i18n/global-messages';
import type { TransactionDirectionType, } from '../../../api/ada/adaTypes';
import { transactionTypes } from '../../../api/ada/adaTypes';
import type { AssuranceLevel } from '../../../types/transactionAssuranceTypes';
import environment from '../../../environment';
import { Logger } from '../../../utils/logging';
import expandArrow from '../../../assets/images/expand-arrow.inline.svg';
import RawHash from '../../widgets/hashWrappers/RawHash';
import ExplorableHashContainer from '../../../containers/widgets/ExplorableHashContainer';
import type { ExplorerType } from '../../../domain/Explorer';
import { TxStatusCodes, } from '../../../api/ada/lib/storage/database/transactions/tables';
import type { TxStatusCodesType, } from '../../../api/ada/lib/storage/database/transactions/tables';

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
  transactionId: {
    id: 'wallet.transaction.transactionId',
    defaultMessage: '!!!Transaction ID',
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
  fee: {
    id: 'wallet.transaction.fee',
    defaultMessage: '!!!Fee',
  },
  fromAddresses: {
    id: 'wallet.transaction.addresses.from',
    defaultMessage: '!!!From addresses',
  },
  toAddress: {
    id: 'wallet.transaction.address.to',
    defaultMessage: '!!!To address',
  },
  toAddresses: {
    id: 'wallet.transaction.addresses.to',
    defaultMessage: '!!!To addresses',
  },
  transactionAmount: {
    id: 'wallet.transaction.transactionAmount',
    defaultMessage: '!!!Transaction amount',
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
  data: WalletTransaction,
  state: TxStatusCodesType,
  selectedExplorer: ExplorerType,
  assuranceLevel: AssuranceLevel,
  isLastInList: boolean,
  formattedWalletAmount: Function,
|};

type State = {
  isExpanded: boolean,
};

export default class Transaction extends Component<Props, State> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    isExpanded: false
  };

  toggleDetails() {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  getTransactionHeaderMsg(
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

  getAmountStyle(amt: BigNumber) {
    return classNames([
      styles.amount,
      amt.lt(0)
        ? styles.amountSent
        : styles.amountReceived
    ]);
  }

  getStatusString(
    intl: $npm$ReactIntl$IntlFormat,
    state: number,
    assuranceLevel: AssuranceLevel,
  ) {
    if (state === TxStatusCodes.IN_BLOCK) {
      return intl.formatMessage(assuranceLevelTranslations[assuranceLevel]);
    }
    if (state === TxStatusCodes.PENDING) {
      return intl.formatMessage(stateTranslations.pending);
    }
    if (state < 0) {
      return intl.formatMessage(stateTranslations.failed);
    }
    throw new Error('getStatusString unexpected state ' + state);
  }

  render() {
    const data = this.props.data;
    const { isLastInList, state, assuranceLevel, formattedWalletAmount } = this.props;
    const { isExpanded } = this.state;
    const { intl } = this.context;
    const isFailedTransaction = state < 0;
    const isPendingTransaction = state === TxStatusCodes.PENDING;

    const componentStyles = classNames([
      styles.component,
      isFailedTransaction ? styles.failed : null,
      isPendingTransaction ? styles.pending : null,
    ]);

    const contentStyles = classNames([
      styles.content,
      isLastInList ? styles.last : null
    ]);

    const detailsStyles = classNames([
      styles.details,
      isExpanded ? styles.expanded : styles.closed
    ]);

    const labelOkClasses = classNames([
      styles.label,
      styles[assuranceLevel]
    ]);

    const labelClasses = classNames([
      styles.label,
      styles[`${state}Label`]
    ]);

    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const status = this.getStatusString(intl, state, assuranceLevel);

    const currency = intl.formatMessage(environmentSpecificMessages[environment.API].currency);
    const symbol = adaSymbol;

    return (
      <div className={componentStyles}>

        {/* ==== Clickable Header -> toggles details ==== */}
        <div className={styles.toggler} onClick={this.toggleDetails.bind(this)} role="presentation" aria-hidden>
          <div className={styles.togglerContent}>
            <div className={styles.header}>
              <div className={styles.title}>
                { this.getTransactionHeaderMsg(intl, currency, data.type) }
              </div>
              <div className={styles.time}>
                {moment(data.date).format('hh:mm:ss A')}
              </div>
              {state === TxStatusCodes.IN_BLOCK ? (
                <div className={labelOkClasses}>{status}</div>
              ) : (
                <div className={labelClasses}>
                  {status}
                </div>
              )}

              <div className={this.getAmountStyle(data.amount)}>
                {
                  // hide currency (we are showing symbol instead)
                  formattedWalletAmount(data.amount, false)
                }
                <SvgInline svg={symbol} className={styles.currencySymbol} />
              </div>

              <div className={styles.expandArrowBox}>
                <SvgInline className={arrowClasses} svg={expandArrow} />
              </div>
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
              {data.type !== transactionTypes.INCOME && (
                <div>
                  <h2>
                    {intl.formatMessage(messages.fee)}
                  </h2>
                  <span className={styles.rowData}>
                    {formattedWalletAmount(data.fee.abs(), false)}
                  </span>
                </div>
              )}
              <h2>
                {intl.formatMessage(messages.fromAddresses)}
              </h2>
              {uniq(data.addresses.from).map(address => (
                <ExplorableHashContainer
                  key={`${data.id}-from-${address}`}
                  selectedExplorer={this.props.selectedExplorer}
                  hash={address}
                  light
                  linkType="address"
                >
                  <RawHash light>
                    {address}<br />
                  </RawHash>
                </ExplorableHashContainer>
              ))}
              <h2>
                {intl.formatMessage(messages.toAddresses)}
              </h2>
              {data.addresses.to.map((address, addressIndex) => (
                <ExplorableHashContainer
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${data.id}-to-${address}-${addressIndex}`}
                  selectedExplorer={this.props.selectedExplorer}
                  hash={address}
                  light
                  linkType="address"
                >
                  <RawHash light>
                    {address}<br />
                  </RawHash>
                </ExplorableHashContainer>
              ))}

              {environment.isAdaApi() ? (
                <div className={styles.row}>
                  <h2>{intl.formatMessage(messages.assuranceLevel)}</h2>
                  {state === TxStatusCodes.IN_BLOCK ? (
                    <span className={styles.rowData}>
                      <span className={styles.assuranceLevel}>{status}</span>
                      . {data.numberOfConfirmations} {intl.formatMessage(messages.confirmations)}.
                    </span>
                  ) : null}
                </div>
              ) : null}

              <h2>{intl.formatMessage(messages.transactionId)}</h2>
              <ExplorableHashContainer
                selectedExplorer={this.props.selectedExplorer}
                hash={data.id}
                light
                linkType="transaction"
              >
                <RawHash light>
                  {data.id}
                </RawHash>
              </ExplorableHashContainer>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
