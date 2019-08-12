// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import SvgInline from 'react-svg-inline';
import adaSymbolSmallest from '../../../assets/images/ada-symbol-smallest-dark.inline.svg';
import exportTxToFileSvg from '../../../assets/images/transaction/export-tx-to-file.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import { DECIMAL_PLACES_IN_ADA } from '../../../config/numbersConfig';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmountType';
import styles from './WalletSummary.scss';
import type { CoinPriceCurrencySettingType } from '../../../types/coinPriceType';

const messages = defineMessages({
  pendingOutgoingConfirmationLabel: {
    id: 'wallet.summary.page.pendingOutgoingConfirmationLabel',
    defaultMessage: '!!!Outgoing pending confirmation',
  },
  pendingIncomingConfirmationLabel: {
    id: 'wallet.summary.page.pendingIncomingConfirmationLabel',
    defaultMessage: '!!!Incoming pending confirmation',
  },
  numOfTxsLabel: {
    id: 'wallet.summary.page.transactionsLabel',
    defaultMessage: '!!!Number of transactions',
  },
  exportIconTooltip: {
    id: 'wallet.transaction.export.exportIcon.tooltip',
    defaultMessage: '!!!Export to file',
  }
});

type Props = {|
  numberOfTransactions: number,
  pendingAmount: UnconfirmedAmount,
  isLoadingTransactions: boolean,
  openExportTxToFileDialog: Function,
  coinPriceCurrencySetting: CoinPriceCurrencySettingType,
|};

@observer
export default class WalletSummary extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      pendingAmount,
      numberOfTransactions,
      isLoadingTransactions,
      openExportTxToFileDialog,
      coinPriceCurrencySetting,
    } = this.props;
    const { intl } = this.context;

    return (
      <div className={styles.component}>
        <div className={styles.leftBlock} />
        <div className={styles.middleBlock}>
          <BorderedBox>
            {pendingAmount.incoming.isGreaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                : <span>{pendingAmount.incoming.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} />
                {pendingAmount.incomingInSelectedCurrency && coinPriceCurrencySetting.enabled ? 
                  (<span>
                    / {pendingAmount.incomingInSelectedCurrency.toString()}
                    {coinPriceCurrencySetting.currency}
                  </span>) : ''
                }
              </div>
            }
            {pendingAmount.outgoing.isGreaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                : <span>{pendingAmount.outgoing.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} />
                {pendingAmount.outgoingInSelectedCurrency && coinPriceCurrencySetting.enabled ? 
                  (<span>
                    / {pendingAmount.outgoingInSelectedCurrency.toString()}
                    {coinPriceCurrencySetting.currency}
                  </span>) : ''
                }
              </div>
            }
            {!isLoadingTransactions ? (
              <div className={styles.numberOfTransactions}>
                {intl.formatMessage(messages.numOfTxsLabel)}: <span>{numberOfTransactions}</span>
              </div>
            ) : null}
          </BorderedBox>
        </div>
        <div className={styles.rightBlock}>
          {!isLoadingTransactions ? (
            <SvgInline
              svg={exportTxToFileSvg}

              className={styles.exportTxToFileSvg}
              title={intl.formatMessage(messages.exportIconTooltip)}
              onClick={openExportTxToFileDialog}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
