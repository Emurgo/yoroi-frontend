// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import AdaSymbolSmallest from '../../../assets/images/ada-symbol-smallest-dark.inline.svg';
import ExportTxToFileSvg from '../../../assets/images/transaction/export-tx-to-file.inline.svg';
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

type Props = {|
  +numberOfTransactions: number,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: Function,
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
                <span className={styles.currencySymbolSmallest}>
                  <AdaSymbolSmallest />
                </span>
              </div>
            }
            {pendingAmount.outgoing.isGreaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                : <span>{pendingAmount.outgoing.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <span className={styles.currencySymbolSmallest}>
                  <AdaSymbolSmallest />
                </span>
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
            <span
              className={styles.exportTxToFileSvg}
              title={intl.formatMessage(messages.exportIconTooltip)}
              onClick={openExportTxToFileDialog}
              onKeyPress={openExportTxToFileDialog}
              role="button"
              tabIndex="0"
            >
              <ExportTxToFileSvg />
            </span>
          ) : null}
        </div>
      </div>
    );
  }
}
