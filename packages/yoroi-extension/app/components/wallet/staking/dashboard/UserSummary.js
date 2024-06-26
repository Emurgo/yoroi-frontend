// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape, FormattedMessage } from 'react-intl';
import type { $npm$ReactIntl$MessageDescriptor, $npm$ReactIntl$IntlFormat } from 'react-intl';
import { Button } from '@mui/material';
import Card from './Card';
import styles from './UserSummary.scss';
import { ReactComponent as IconAda } from '../../../../assets/images/dashboard/grey-total-ada.inline.svg';
import { ReactComponent as IconRewards } from '../../../../assets/images/dashboard/grey-total-reward.inline.svg';
import globalMessages from '../../../../i18n/global-messages';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import type { TokenEntry, TokenLookupKey } from '../../../../api/common/lib/MultiToken';
import { getTokenName } from '../../../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../../../api/ada/lib/storage/database/primitives/tables';
import { hiddenAmount } from '../../../../utils/strings';
import { truncateToken } from '../../../../utils/formatters';
import { ReactComponent as InfoIcon } from '../../../../assets/images/attention-big-light.inline.svg';
import Skeleton from '@mui/material/Skeleton';
import { Box } from '@mui/system';

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
    defaultMessage:
      '!!!This balance includes rewards (withdrawal required to be able to send this full amount)',
  },
  mangledPopupDialogLine2: {
    id: 'wallet.dashboard.summary.mangled.line2',
    defaultMessage: '!!!We recommend to {transactionMessage} to delegate the {ticker}',
  },
  makeTransaction: {
    id: 'wallet.dashboard.summary.mangled.makeTx',
    defaultMessage: '!!!make a transaction',
  },
  delegated: {
    id: 'wallet.dashboard.summary.delegated',
    defaultMessage: '!!!Delegated',
  },
});

type Props = {|
  /** need this since we need to show the ticker names while spinner is still showing */
  +defaultTokenInfo: $ReadOnly<TokenRow>,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +totalSum: void | MultiToken,
  +totalRewards: void | MultiToken,
  +isDelegated: boolean,
  +unitOfAccount: TokenEntry => void | {| currency: string, amount: string |},
  +shouldHideBalance: boolean,
  +openLearnMore: void => void,
  +canUnmangleSum: MultiToken,
  +cannotUnmangleSum: MultiToken,
  +onUnmangle: void => void,
  +withdrawRewards: void | (void => void),
|};

@observer
export default class UserSummary extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
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
      <div className={styles.card}>
        {!this.props.totalSum ? (
          this.getCardSkeleton('total')
        ) : (
          <div className={styles.cardContent}>
            <div>
              <h3 className={styles.label}>
                <span>
                  {intl.formatMessage(globalMessages.totalTokenLabel, {
                    ticker: truncateToken(getTokenName(this.props.defaultTokenInfo)),
                  })}
                  :
                  {this.props.isDelegated && (
                    <span className={styles.delegated}>
                      {intl.formatMessage(messages.delegated)}
                    </span>
                  )}
                </span>
              </h3>
              {this.renderAmount(this.props.totalSum)}
            </div>
            <div className={styles.amountNote}>{intl.formatMessage(messages.adaAmountNote)}</div>
          </div>
        )}
        <div className={styles.icon}>
          <IconAda />
        </div>
      </div>
    );
  };

  getTotalRewards: void => Node = () => {
    const { intl } = this.context;
    return (
      <div className={styles.card}>
        {!this.props.totalRewards ? (
          this.getCardSkeleton('rewards')
        ) : (
          <div className={styles.cardContent}>
            <div>
              <h3 className={styles.label}>
                <span>{intl.formatMessage(globalMessages.totalRewardsLabel)}:</span>
                <button
                  className={styles.infoIcon}
                  type="button"
                  onClick={this.props.openLearnMore}
                >
                  <InfoIcon />
                </button>
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
            </div>
          </div>
        )}

        <div className={styles.icon}>
          <IconRewards />
        </div>
      </div>
    );
  };

  getSkeleton(
    layout: {|
      width: string,
      height: string,
      marginBottom: string,
    |},
    _index: number
  ): Node {
    return (
      <Skeleton
        variant="rectangular"
        width={layout.width}
        height={layout.height}
        animation="wave"
        sx={{
          backgroundColor: 'var(--yoroi-palette-gray-50)',
          borderRadius: '4px',
          marginBottom: layout.marginBottom,
        }}
      />
    );
  }

  getCardSkeleton(card: 'rewards' | 'total'): Node {
    const skeletons = [
      { width: '50%', height: '15px', marginBottom: '5px' }, // Label
      { width: '85%', height: '32px', marginBottom: card === 'rewards' ? '25px' : '16px' }, // Amount
      { width: card === 'rewards' ? '43%' : '70%', height: '57px', marginBottom: '0px' }, // Text / Button
    ];
    return <Box>{skeletons.map(this.getSkeleton)}</Box>;
  }

  renderAmount: (void | MultiToken) => Node = token => {
    if (!token) throw new Error('Token is not defined - Should never happend');
    const unitOfAccount = this.props.unitOfAccount(token.getDefaultEntry());

    const entryNode = (
      <div className={styles.value}>{this.formatTokenEntry(token.getDefaultEntry())}</div>
    );
    const unitOfAccountNode = unitOfAccount ? (
      <div className={styles.value}>
        {unitOfAccount.amount} {unitOfAccount.currency}
      </div>
    ) : (
      <></>
    );

    return (
      <>
        {unitOfAccountNode}
        {entryNode}
      </>
    );
  };

  formatWithAmount: ($npm$ReactIntl$MessageDescriptor, TokenEntry) => Node = (
    message,
    tokenEntry
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
          adaAmount: this.props.shouldHideBalance ? hiddenAmount : amount,
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
    const amountNode = this.props.shouldHideBalance ? <>{hiddenAmount}</> : <>{tokenAmount}</>;
    return (
      <>
        <span>{amountNode} </span>
        {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };
}
