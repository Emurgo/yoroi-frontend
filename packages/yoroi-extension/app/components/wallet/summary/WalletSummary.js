// @flow
import { Component, } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import { ReactComponent as ExportTxToFileSvg }  from '../../../assets/images/transaction/export-tx-to-file.inline.svg';
import BorderedBox from '../../widgets/BorderedBox';
import type { UnconfirmedAmount } from '../../../types/unconfirmedAmountType';
import globalMessages from '../../../i18n/global-messages';
import styles from './WalletSummary.scss';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import { formatValue } from '../../../utils/unit-of-account';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { splitAmount, truncateToken } from '../../../utils/formatters';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../../utils/strings';
import type {
  TokenLookupKey,
} from '../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../api/ada/lib/storage/database/primitives/tables';

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
  +shouldHideBalance: boolean,
  +pendingAmount: UnconfirmedAmount,
  +isLoadingTransactions: boolean,
  +openExportTxToFileDialog: void => void,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
|};

@observer
export default class WalletSummary extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  renderAmountDisplay: {|
    shouldHideBalance: boolean,
    amount: MultiToken
  |} => Node = (request) => {
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = (<span>{hiddenAmount}</span>);
    } else {
      const shiftedAmount = defaultEntry.amount
        .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (<>{balanceDisplay} {truncateToken(getTokenName(tokenInfo))}</>);
  }

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
                {(!pendingAmount.incoming.isEmpty() || !pendingAmount.outgoing.isEmpty()) && (
                  <div className={styles.pendingSection}>
                    {!pendingAmount.incoming.isEmpty() &&
                      <div className={styles.pendingConfirmation}>
                        {`${intl.formatMessage(messages.pendingIncomingConfirmationLabel)}`}
                        :&nbsp;
                        {pendingAmount.incomingInSelectedCurrency &&
                        unitOfAccountSetting.enabled
                          ? (
                            <span className={styles.amount}>
                              {formatValue(pendingAmount.incomingInSelectedCurrency)}
                              {' ' + unitOfAccountSetting.currency}
                            </span>
                          ) : (
                            <>
                              <span className={styles.amount}>
                                {this.renderAmountDisplay({
                                  shouldHideBalance: this.props.shouldHideBalance,
                                  amount: pendingAmount.incoming,
                                })}
                              </span>
                            </>
                          )}
                      </div>
                    }
                    {!pendingAmount.outgoing.isEmpty() &&
                      <div className={styles.pendingConfirmation}>
                        {`${intl.formatMessage(messages.pendingOutgoingConfirmationLabel)}`}
                        :&nbsp;
                        {pendingAmount.outgoingInSelectedCurrency &&
                          unitOfAccountSetting.enabled
                          ? (
                            <span className={styles.amount}>
                              {formatValue(pendingAmount.outgoingInSelectedCurrency)}
                              {' ' + unitOfAccountSetting.currency}
                            </span>
                          ) : (
                            <>
                              <span className={styles.amount}>
                                {this.renderAmountDisplay({
                                  shouldHideBalance: this.props.shouldHideBalance,
                                  amount: pendingAmount.outgoing,
                                })}
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
