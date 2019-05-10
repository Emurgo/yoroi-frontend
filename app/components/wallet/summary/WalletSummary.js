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

type Props = {
  numberOfTransactions: number,
  pendingAmount: UnconfirmedAmount,
  isLoadingTransactions: boolean,
  openExportTxToFileDialog: Function,
  classicTheme: boolean,
};

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
      classicTheme,
    } = this.props;
    const { intl } = this.context;
    const componentClasses = classicTheme ? styles.componentClassic : styles.component;
    return (
      <div className={componentClasses}>
        <div className={styles.leftBlock} />
        <div className={styles.middleBlock}>
          <BorderedBox>
            {pendingAmount.incoming.greaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                : <span>{pendingAmount.incoming.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} />
              </div>
            }
            {pendingAmount.outgoing.greaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                : <span>{pendingAmount.outgoing.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} />
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
