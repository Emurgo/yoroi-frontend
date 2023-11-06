// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import moment from 'moment';

import Notice, { NoticeKind } from '../../domain/Notice';
import { ReactComponent as DelegatedIcon }  from '../../assets/images/notice-board/delegated.inline.svg';
import { ReactComponent as UndelegatedIcon }  from '../../assets/images/notice-board/undelegated.inline.svg';
import { ReactComponent as RedelegatedIcon }  from '../../assets/images/notice-board/redelegated.inline.svg';
import { ReactComponent as FeeChangedIcon }  from '../../assets/images/notice-board/fee-changed.inline.svg';
import { ReactComponent as CostChangedIcon }  from '../../assets/images/notice-board/cost-changed.inline.svg';
import { ReactComponent as RewardRecievedIcon }  from '../../assets/images/notice-board/reward-received.inline.svg';
import { ReactComponent as PoolToRetireIcon }  from '../../assets/images/notice-board/retired.inline.svg';
import { ReactComponent as NoRewardForUndelegationIcon }  from '../../assets/images/notice-board/reward-not-received.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './NoticeBlock.scss';

const messages = defineMessages({
  titleStakeDelegated: {
    id: 'noticeBoard.notice.stakeDelegated.title',
    defaultMessage: '!!!You have delegated to the pool [{poolTicker}]',
  },
  subMessageStakeDelegated: {
    id: 'noticeBoard.notice.stakeDelegated.subMessage',
    defaultMessage: '!!!You will start getting rewards from next epoch',
  },
  titleStakeUndelegated: {
    id: 'noticeBoard.notice.stakeUndelegated.title',
    defaultMessage: '!!!You have undelegated from the pool [{poolTicker}]',
  },
  subMessageStakeUndelegated: {
    id: 'noticeBoard.notice.stakeUndelegated.subMessage',
    defaultMessage: '!!!Rewards for next two epochs will still be received',
  },
  titleStakeRedelegated: {
    id: 'noticeBoard.notice.stakeRedelegated.title',
    defaultMessage: '!!!You have re-delegated to another pool [{poolTicker}]',
  },
  subMessageStakeRedelegated: {
    id: 'noticeBoard.notice.stakeRedelegated.subMessage',
    defaultMessage: '!!!Rewards for next two epochs will still be received from pool [{poolTicker}]',
  },
  titlefeeChanged: {
    id: 'noticeBoard.notice.feeChanged.title',
    defaultMessage: '!!!Stake pool fee has changed',
  },
  subMessageFeeChanged: {
    id: 'noticeBoard.notice.feeChanged.subMessage',
    defaultMessage: '!!!Old fee was {oldFee} {currency} and new fee is {newFee} {currency}',
  },
  titleCostChanged: {
    id: 'noticeBoard.notice.costChanged.title',
    defaultMessage: '!!!Stake pool cost has changed',
  },
  subMessageCostChanged: {
    id: 'noticeBoard.notice.costChanged.subMessage',
    defaultMessage: '!!!Old cost was {oldCost} {currency} and new cost is {newCost} {currency}',
  },
  titleRewardRecieved: {
    id: 'noticeBoard.notice.rewardRecieved.title',
    defaultMessage: '!!!Rewards have been received',
  },
  subMessageRewardRecieved: {
    id: 'noticeBoard.notice.rewardRecieved.subMessage',
    defaultMessage: '!!!You have received {rewardAmount} {currency} as rewards for epoch {epochNumber}',
  },
  titlePoolToRetire: {
    id: 'noticeBoard.notice.poolToRetire.title',
    defaultMessage: '!!!Pool [{poolTicker}] is planning to retire',
  },
  subMessagePoolToRetire: {
    id: 'noticeBoard.notice.poolToRetire.subMessage',
    defaultMessage: '!!!To continue getting rewards you can delegate your stake to other pool',
  },
  titleNoRewardsForDelegation: {
    id: 'noticeBoard.notice.noRewardForUndelegation.title',
    defaultMessage: '!!!You have not received any rewards for passed epoch',
  },
  subMessageNoRewardsForDelegation: {
    id: 'noticeBoard.notice.noRewardForUndelegation.subMessage',
    defaultMessage: '!!!As two epochs ago you have undelegated from all pools',
  },
});

type Props = {|
  +notice: Notice,
  +isToday: boolean
|};

@observer
export default class NoticeBlock extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = { intl: intlShape.isRequired };

  formatTime(notice: Notice, isToday: boolean): string {
    if (isToday) return moment(notice.date).fromNow();
    return moment(notice.date).format('HH:mm:ss');
  }

  render(): null | Node {
    const { intl } = this.context;
    const { notice, isToday } = this.props;

    let icon;
    let title;
    let subMessage;
    const time = this.formatTime(notice, isToday);
    const { poolTicker } = notice;
    switch (notice.kind) {
      case NoticeKind.STAKE_DELEGATED:
        title = (
          <FormattedMessage
            {...messages.titleStakeDelegated}
            values={{ poolTicker }}
          />);
        subMessage = intl.formatMessage(messages.subMessageStakeDelegated);
        icon = (<span><DelegatedIcon /></span>);
        break;
      case NoticeKind.STAKE_UNDELEGATED:
        title = (
          <FormattedMessage
            {...messages.titleStakeUndelegated}
            values={{ poolTicker }}
          />);
        subMessage = intl.formatMessage(messages.subMessageStakeUndelegated);
        icon = (<span><UndelegatedIcon /></span>);
        break;
      case NoticeKind.STAKE_REDELEGATED:
        title = (
          <FormattedMessage
            {...messages.titleStakeRedelegated}
            values={{ poolTicker }}
          />);
        subMessage =  (
          <FormattedMessage
            {...messages.subMessageStakeRedelegated}
            values={{ poolTicker: notice.oldPoolTicker }}
          />);
        icon = (<span><RedelegatedIcon /></span>);
        break;
      case NoticeKind.FEE_CHANGED:
        title = intl.formatMessage(messages.titlefeeChanged);
        subMessage =  (
          <FormattedMessage
            {...messages.subMessageFeeChanged}
            values={{ oldFee: notice.oldFee, newFee: notice.newFee, currency: 'ADA' }}
          />);
        icon = (<span><FeeChangedIcon /></span>);
        break;
      case NoticeKind.COST_CHANGED:
        title = intl.formatMessage(messages.titleCostChanged);
        subMessage =  (
          <FormattedMessage
            {...messages.subMessageCostChanged}
            values={{ oldCost: notice.oldCost, newCost: notice.newCost, currency: 'ADA' }}
          />);
        icon = (<span><CostChangedIcon /></span>);
        break;
      case NoticeKind.REWARD_RECEIVED:
        title = intl.formatMessage(messages.titleRewardRecieved);
        subMessage =  (
          <FormattedMessage
            {...messages.subMessageRewardRecieved}
            values={{ rewardAmount: notice.rewardAmount, epochNumber: notice.epochNumber, currency: 'ADA' }}
          />);
        icon = (<span><RewardRecievedIcon /></span>);
        break;
      case NoticeKind.POOL_TO_RETIRE:
        title = (
          <FormattedMessage
            {...messages.titlePoolToRetire}
            values={{ poolTicker }}
          />);
        subMessage = intl.formatMessage(messages.subMessagePoolToRetire);
        icon = (<span><PoolToRetireIcon /></span>);
        break;
      case NoticeKind.NO_REWARDS_FOR_UNDELEGATION:
        title = intl.formatMessage(messages.titleNoRewardsForDelegation);
        subMessage = intl.formatMessage(messages.subMessageNoRewardsForDelegation);
        icon = (<span><NoRewardForUndelegationIcon /></span>);
        break;
      default:
        return (null);
    }

    return (
      <div className={styles.component}>
        <div className={styles.wrap}>
          <div className={styles.iconBlock}>{icon}</div>
          <div className={styles.infoBlock}>
            <div className={styles.firstRow}>
              <div className={styles.title}>{title}</div>
              <div className={styles.time}>{time}</div>
            </div>
            <div className={styles.secondRow}>{subMessage}</div>
          </div>
        </div>
        <div className={styles.line} />
      </div>
    );
  }
}
