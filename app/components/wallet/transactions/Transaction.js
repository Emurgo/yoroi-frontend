import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import moment from 'moment';
import SvgInline from 'react-svg-inline';
import classNames from 'classnames';
import { uniq } from 'lodash';
import styles from './Transaction.scss';
import adaSymbol from '../../../assets/images/ada-symbol.inline.svg';
import WalletTransaction, { transactionStates, transactionTypes } from '../../../domain/WalletTransaction';
import { assuranceLevels } from '../../../config/transactionAssuranceConfig';
import { environmentSpecificMessages } from '../../../i18n/global-messages';
import type { TransactionState } from '../../../domain/WalletTransaction';
import environment from '../../../environment';
import { Logger } from '../../../utils/logging';
import expandArrow from '../../../assets/images/expand-arrow.inline.svg';

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
  [assuranceLevels.LOW]: {
    id: 'wallet.transaction.assuranceLevel.low',
    defaultMessage: '!!!low',
  },
  [assuranceLevels.MEDIUM]: {
    id: 'wallet.transaction.assuranceLevel.medium',
    defaultMessage: '!!!medium',
  },
  [assuranceLevels.HIGH]: {
    id: 'wallet.transaction.assuranceLevel.high',
    defaultMessage: '!!!high',
  },
});

const stateTranslations = defineMessages({
  [transactionStates.PENDING]: {
    id: 'wallet.transaction.state.pending',
    defaultMessage: '!!!Transaction pending',
  },
  [transactionStates.FAILED]: {
    id: 'wallet.transaction.state.failed',
    defaultMessage: '!!!Transaction failed',
  },
});

type Props = {
  data: WalletTransaction,
  state: TransactionState,
  assuranceLevel: string,
  isLastInList: boolean,
  formattedWalletAmount: Function,
  classicTheme: boolean
};

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

  getTransactionHeaderMsg(intl, currency: string, type: TransactionType): string {
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
  }

  getAmountStyle(amt: BigNumber, classicTheme: boolean) {
    return classNames([
      classicTheme ? styles.amountClassic : styles.amount,
      amt.lt(0)
        ? styles.amountSent
        : styles.amountReceived
    ]);
  }

  render() {
    const data = this.props.data;
    const { isLastInList, state, assuranceLevel, formattedWalletAmount, classicTheme } = this.props;
    const { isExpanded } = this.state;
    const { intl } = this.context;
    const isFailedTransaction = state === transactionStates.FAILED;
    const isPendingTransaction = state === transactionStates.PENDING;

    const componentStyles = classNames([
      classicTheme ? styles.componentClassic : styles.component,
      isFailedTransaction ? styles.failed : null,
      isPendingTransaction ? styles.pending : null,
    ]);

    const contentStyles = classNames([
      classicTheme ? styles.contentClassic : styles.content,
      isLastInList ? styles.last : null
    ]);

    const detailsStyles = classNames([
      classicTheme ? styles.detailsClassic : styles.details,
      isExpanded ? styles.expanded : styles.closed
    ]);

    const togglerClasses = classicTheme ? styles.togglerClassic : styles.toggler;
    const titleClasses = classicTheme ? styles.titleClassic : styles.title;
    const typeClasses = classicTheme ? styles.typeClassic : styles.type;
    const labelOkClasses = classNames([
      classicTheme ? styles.labelClassic : styles.label,
      styles[assuranceLevel]
    ]);
    const labelClasses = classNames([
      classicTheme ? styles.labelClassic : styles.label,
      classicTheme ? styles[`${state}LabelClassic`] : styles[`${state}Label`]
    ]);
    const currencySymbolClasses = classicTheme
      ? styles.currencySymbolClassic
      : styles.currencySymbol;
    const arrowClasses = isExpanded ? styles.collapseArrow : styles.expandArrow;

    const status = intl.formatMessage(assuranceLevelTranslations[assuranceLevel]);
    const currency = intl.formatMessage(environmentSpecificMessages[environment.API].currency);
    const symbol = adaSymbol;

    return (
      <div className={componentStyles}>

        {/* ==== Clickable Header -> toggles details ==== */}
        <div className={togglerClasses} onClick={this.toggleDetails.bind(this)} role="presentation" aria-hidden>
          <div className={styles.togglerContent}>
            <div className={styles.header}>
              <div className={titleClasses}>
                { this.getTransactionHeaderMsg(intl, currency, data.type) }
              </div>
              <div className={typeClasses}>
                {moment(data.date).format('hh:mm:ss A')}
              </div>
              {state === transactionStates.OK ? (
                <div className={labelOkClasses}>{status}</div>
              ) : (
                <div className={labelClasses}>
                  {intl.formatMessage(stateTranslations[state])}
                </div>
              )}

              <div className={this.getAmountStyle(data.amount, classicTheme)}>
                {
                  // hide currency (we are showing symbol instead)
                  formattedWalletAmount(data.amount, false)
                }
                <SvgInline svg={symbol} className={currencySymbolClasses} />
              </div>

              {!classicTheme && (
                <div className={styles.expandArrowBox}>
                  <SvgInline className={arrowClasses} svg={expandArrow} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==== Toggleable Transaction Details ==== */}
        <div className={contentStyles}>
          <div className={detailsStyles}>
            { /* converting assets is not implemented but we may use it in the future for tokens */}
            {data.exchange && data.conversionRate && (
              <div className={styles.conversion}>
                <div>
                  <h2>{intl.formatMessage(messages.exchange)}</h2>
                  <span>{data.exchange}</span>
                </div>
                <div className={styles.conversionRate}>
                  <h2>{intl.formatMessage(messages.conversionRate)}</h2>
                  <span>{data.conversionRate}</span>
                </div>
              </div>
            )}
            <div>
              {data.type !== transactionTypes.INCOME && (
                <div>
                  <h2>
                    {intl.formatMessage(messages.fee)}
                  </h2>
                  <span>{formattedWalletAmount(data.fee.abs(), false)}</span>
                </div>
              )}
              <h2>
                {intl.formatMessage(messages.fromAddresses)}
              </h2>
              {uniq(data.addresses.from).map(address => (
                <span key={`${data.id}-from-${address}`} className={styles.address}>{address}</span>
              ))}
              <h2>
                {intl.formatMessage(messages.toAddresses)}
              </h2>
              {data.addresses.to.map((address, addressIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={`${data.id}-to-${address}-${addressIndex}`} className={styles.address}>{address}</span>
              ))}

              {environment.isAdaApi() ? (
                <div className={styles.row}>
                  <h2>{intl.formatMessage(messages.assuranceLevel)}</h2>
                  {state === transactionStates.OK ? (
                    <span>
                      <span className={styles.assuranceLevel}>{status}</span>
                      . {data.numberOfConfirmations} {intl.formatMessage(messages.confirmations)}.
                    </span>
                  ) : null}
                </div>
              ) : null}

              <h2>{intl.formatMessage(messages.transactionId)}</h2>
              <span className={styles.address}>{data.id}</span>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
