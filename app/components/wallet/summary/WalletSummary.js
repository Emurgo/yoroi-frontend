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
    description: '"Outgoing pending confirmation" label on Wallet summary page'
  },
  pendingIncomingConfirmationLabel: {
    id: 'wallet.summary.page.pendingIncomingConfirmationLabel',
    defaultMessage: '!!!Incoming pending confirmation',
    description: '"Incoming pending confirmation" label on Wallet summary page'
  },
  numOfTxsLabel: {
    id: 'wallet.summary.page.transactionsLabel',
    defaultMessage: '!!!Number of transactions',
    description: '"Number of transactions" label on Wallet summary page'
  },
  exportIconTooltip: {
    id: 'wallet.transaction.export.exportIcon.tooltip',
    defaultMessage: '!!!Export to file',
    description: '"Export" icon tooltip'
  }
});

type Props = {
  numberOfTransactions: number,
  pendingAmount: UnconfirmedAmount,
  isLoadingTransactions: boolean,
  openExportTxToFileDialog: Function,
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
      openExportTxToFileDialog
    } = this.props;
    const { intl } = this.context;
    return (
      <div className={styles.component}>
        <div className={styles.leftBlock} />
        <div className={styles.middleBlock}>
          <BorderedBox>
            {pendingAmount.incoming.greaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                : <span>{pendingAmount.incoming.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} cleanup={['title']} />
              </div>
            }
            {pendingAmount.outgoing.greaterThan(0) &&
              <div className={styles.pendingConfirmation}>
                {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                : <span>{pendingAmount.outgoing.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                <SvgInline svg={adaSymbolSmallest} className={styles.currencySymbolSmallest} cleanup={['title']} />
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
              cleanup={['title']}
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
