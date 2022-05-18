// @flow
import { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button } from '@mui/material';
import Card from './Card';
import styles from './UserSummary.scss';
import { ReactComponent as IconAda }  from '../../../../assets/images/dashboard/grey-total-ada.inline.svg';
import { ReactComponent as IconRewards }  from '../../../../assets/images/dashboard/grey-total-reward.inline.svg';
import { ReactComponent as IconDelegated }  from '../../../../assets/images/dashboard/grey-total-delegated.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import TooltipBox from '../../../widgets/TooltipBox';
import { ReactComponent as WarningIcon }  from '../../../../assets/images/attention-modern.inline.svg';
import LoadingSpinner from '../../../widgets/LoadingSpinner';
import {
  MultiToken,
} from '../../../../api/common/lib/MultiToken';
import type {
  TokenEntry, TokenLookupKey,
} from '../../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { hiddenAmount } from '../../../../utils/strings';
import { truncateToken } from '../../../../utils/formatters';

const messages = defineMessages({
  title: {
    id: 'wallet.dashboard.summary.title',
    defaultMessage: '!!!Your Summary',
  },
  note: {
    id: 'wallet.dashboard.summary.note',
    defaultMessage: '!!!Less than you expected?',
  },
  adaAmountNote: {
    id: 'wallet.dashboard.summary.adaAmountNote',
    defaultMessage: '!!!This balance includes rewards (withdrawal required to be able to send this full amount)',
  },
  mangledPopupDialogLine2: {
    id: 'wallet.dashboard.summary.mangled.line2',
    defaultMessage: '!!!We recommend to {transactionMessage} to delegate the {ticker}',
  },
  makeTransaction: {
    id: 'wallet.dashboard.summary.mangled.makeTx',
    defaultMessage: '!!!make a transaction',
  },
});

type Props = {|
  /** need this since we need to show the ticker names while spinner is still showing */
  +defaultTokenInfo: $ReadOnly<TokenRow>,
  +getTokenInfo: $ReadOnly<Inexact<TokenLookupKey>> => $ReadOnly<TokenRow>,
  +totalSum: void | MultiToken,
  +totalRewards: void | MultiToken,
  +totalDelegated: void | MultiToken,
  +unitOfAccount: TokenEntry => (void | {| currency: string, amount: string |}),
  +shouldHideBalance: boolean,
  +openLearnMore: void => void,
  +canUnmangleSum: MultiToken,
  +cannotUnmangleSum: MultiToken,
  +onUnmangle: void => void,
  +withdrawRewards: void | (void => void),
|};

type State = {|
  mangledPopupOpen: boolean,
|};

@observer
export default class UserSummary extends Component<Props, State> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  state: State = {
    mangledPopupOpen: false,
  };

  render(): Node {
    const { intl } = this.context;
    return (
      <Card title={intl.formatMessage(messages.title)}>
        <div className={styles.wrapper}>
          {this.getTotal()}
          {this.getTotalRewards()}
        </div>
      </Card>
    );
  }

  getTotal: void => Node = () => {
    const { intl } = this.context;

    return (
      <div className={classnames([styles.card, styles.mr20])}>
        <div className={styles.cardContent}>
          <div>
            <h3 className={styles.label}>
              {intl.formatMessage(globalMessages.totalTokenLabel, {
                ticker: truncateToken(getTokenName(this.props.defaultTokenInfo)),
              })}
              :
            </h3>
            {this.renderAmount(this.props.totalSum)}
          </div>
          <div className={styles.amountNote}>
            {intl.formatMessage(messages.adaAmountNote)}
          </div>
        </div>
        <div className={styles.icon}>
          <IconAda />
        </div>
      </div>
    );
  };

  getTotalRewards: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={classnames([styles.card, styles.mr20])}>
        <div className={styles.cardContent}>
          <div>
            <h3 className={styles.label}>
              {intl.formatMessage(globalMessages.totalRewardsLabel)}:
            </h3>
            {this.renderAmount(this.props.totalRewards)}
          </div>
          <div className={styles.footer}>
            {this.props.withdrawRewards != null && (
              <Button
                className="withdrawButton"
                variant="secondary"
                onClick={this.props.withdrawRewards}
                sx={{ height: '46px', width: '144px' }}
              >
                {intl.formatMessage(globalMessages.withdrawLabel)}
              </Button>
            )}
            <div
              className={styles.note}
              role="button"
              tabIndex={0}
              onKeyPress={() => null}
              onClick={this.props.openLearnMore}
            >
              {intl.formatMessage(messages.note)}
            </div>
          </div>
        </div>
        <div className={styles.icon}>
          <IconRewards />
        </div>
      </div>
    );
  };

  renderAmount: (void | MultiToken) => Node = (token) => {
    if (token == null) {
      return (
        <div className={styles.loadingSpinner}>
          <LoadingSpinner small />
        </div>
      );
    }
    const unitOfAccount = this.props.unitOfAccount(
      token.getDefaultEntry()
    );

    const entryNode = (
      <p className={styles.value}>
        {this.formatTokenEntry(token.getDefaultEntry())}
      </p>
    );
    const unitOfAccountNode = unitOfAccount
      ? (
        <p className={styles.value}>
          {unitOfAccount.amount} {unitOfAccount.currency}
        </p>
      ): <></>

    return (
      <>
        {unitOfAccountNode}
        {entryNode}
      </>
    );
  }

  formatWithAmount: ($npm$ReactIntl$MessageDescriptor, TokenEntry) => Node = (
    message,
    tokenEntry,
  ) => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    const amount = tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .toFormat(tokenInfo.Metadata.numberOfDecimals);
    return (
      <FormattedMessage
        {...message}
        values={{
          ticker: truncateToken(getTokenName(tokenInfo)),
          adaAmount: this.props.shouldHideBalance
            ? hiddenAmount
            : amount,
        }}
      />
    );
  };

  formatTokenEntry: TokenEntry => Node = tokenEntry => {
    const tokenInfo = this.props.getTokenInfo(tokenEntry);
    const tokenAmount = tokenEntry.amount
      .shiftedBy(-tokenInfo.Metadata.numberOfDecimals)
      .decimalPlaces(tokenInfo.Metadata.numberOfDecimals)
      .toString();
    const splitAmount = tokenAmount.split('.');
    const amountNode = this.props.shouldHideBalance
      ? <>{hiddenAmount}</>
      : (
        <>
          {splitAmount[0]}
          <span className={styles.decimal}>{splitAmount[1] ? '.' + splitAmount[1] : null} </span>
        </>
      );
    return (
      <>
        <span>
          {amountNode}{' '}
        </span>
        {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };
}
