// @flow
import React, { Component, } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import AdaSymbolSmallest from '../../../assets/images/ada-symbol-smallest-dark.inline.svg';
import ExportTxToFileSvg from '../../../assets/images/transaction/export-tx-to-file.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import { DECIMAL_PLACES_IN_ADA } from '../../../config/numbersConfig';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmountType';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSummary.scss';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { formatValue } from '../../../utils/unit-of-account';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import SearchIcon from '../../../assets/images/search-ic-dark.inline.svg';
import { InputOwnSkin } from '../../../themes/skins/InputOwnSkin';
import { Input } from 'react-polymorph/lib/components/Input';


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
  },
  dateSection: {
    id: 'wallet.summary.page.dateTime',
    defaultMessage: '!!!Date/time',
  },
  typeSection: {
    id: 'wallet.summary.page.type',
    defaultMessage: '!!!Transaction type',
  },
  statusSection: {
    id: 'wallet.summary.page.status',
    defaultMessage: '!!!Status',
  },
});

type Props = {|
  +numberOfTransactions: number,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
|};

@observer
export default class WalletSummary extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      pendingAmount,
      numberOfTransactions,
      isLoadingTransactions,
      openExportTxToFileDialog,
      unitOfAccountSetting,
    } = this.props;
    const { intl } = this.context;

    const content = (
      <div className={styles.content}>
        <div className={styles.leftBlock} />
        <div className={styles.middleBlock}>
          <BorderedBox>
            {!isLoadingTransactions && (
              <>
                <div className={styles.numberOfTransactions}>
                  {intl.formatMessage(messages.numOfTxsLabel)}: <span>{numberOfTransactions}</span>
                </div>
                {(pendingAmount.incoming.gt(0) || pendingAmount.outgoing.gt(0)) && (
                  <div className={styles.pendingSection}>
                    {pendingAmount.incoming.isGreaterThan(0) &&
                      <div className={styles.pendingConfirmation}>
                        {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                        :&nbsp;
                        {pendingAmount.incomingInSelectedCurrency &&
                        unitOfAccountSetting.enabled
                          ? (
                            <span>
                              {formatValue(pendingAmount.incomingInSelectedCurrency)}
                              {' ' + unitOfAccountSetting.currency}
                            </span>
                          ) : (
                            <>
                              <span>{pendingAmount.incoming.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                              <span className={styles.currencySymbolSmallest}>
                                <AdaSymbolSmallest />
                              </span>
                            </>
                          )}
                      </div>
                    }
                    {pendingAmount.outgoing.isGreaterThan(0) &&
                      <div className={styles.pendingConfirmation}>
                        {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                        :&nbsp;
                        {pendingAmount.outgoingInSelectedCurrency &&
                          unitOfAccountSetting.enabled
                          ? (
                            <span>
                              {formatValue(pendingAmount.outgoingInSelectedCurrency)}
                              {' ' + unitOfAccountSetting.currency}
                            </span>
                          ) : (
                            <>
                              <span>{pendingAmount.outgoing.toFormat(DECIMAL_PLACES_IN_ADA)}</span>
                              <span className={styles.currencySymbolSmallest}>
                                <AdaSymbolSmallest />
                              </span>
                            </>
                          )}
                      </div>
                    }
                  </div>
                )}
              </>
            )}
          </BorderedBox>
        </div>
        <div className={styles.rightBlock}>
          {/* ------------ TO MOVE */}
          <div className={styles.searchBtn}>
            <span className={styles.search}><SearchIcon /></span>
            <input type="text" name="" placeholder="Search" />
            <button type="button">
              <span>Filter-ic</span>
            </button>
          </div>
          {/* ------------ */}
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
        <div className={styles.sectionList}>
          <div className={classnames([styles.sectionTitle, styles.time])}>
            {intl.formatMessage(messages.dateSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.type])}>
            {intl.formatMessage(messages.typeSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.status])}>
            {intl.formatMessage(messages.statusSection)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.fee])}>
            {intl.formatMessage(globalMessages.feeLabel)}
          </div>
          <div className={classnames([styles.sectionTitle, styles.amount])}>
            {intl.formatMessage(globalMessages.amountLabel)}
          </div>
        </div>
      </div>
    );

    return (
      <div className={styles.component}>
        {content}
      </div>
    );
  }
}
