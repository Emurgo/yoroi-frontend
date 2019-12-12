// @flow
import React, { Component } from 'react';
import { intlShape, defineMessages, FormattedHTMLMessage } from 'react-intl';
import moment from 'moment';

import Notice, { NoticeKind } from '../../domain/Notice';
import DelegatedIcon from '../../assets/images/notice-board/delegated.inline.svg';
import UndelegatedIcon from '../../assets/images/notice-board/undelegated.inline.svg';
import RedelegatedIcon from '../../assets/images/notice-board/redelegated.inline.svg';
import FeeChangedIcon from '../../assets/images/notice-board/fee-changed.inline.svg';
import CostChangedIcon from '../../assets/images/notice-board/cost-changed.inline.svg';
import RewardRecievedIcon from '../../assets/images/notice-board/reward-received.inline.svg';
import PoolToRetireIcon from '../../assets/images/notice-board/retired.inline.svg';
import NoRewardForUndelegationIcon from '../../assets/images/notice-board/reward-not-received.inline.svg';

import styles from './NoticeBlock.scss';

const messages = defineMessages({
  titleStakeDelegated: {
    id: 'noticeBoard.notice.stakeDelegated.title',
    defaultMessage: '!!!You have delegated to the pool {poolName}',
  },
  subMessageStakeDelegated: {
    id: 'noticeBoard.notice.stakeDelegated.subMessage',
    defaultMessage: '!!!TBD',
  },
  titleStakeUndelegated: {
    id: 'noticeBoard.notice.stakeUndelegated.title',
    defaultMessage: '!!!You have undelegated from the pool {poolName}',
  },
  subMessageStakeUndelegated: {
    id: 'noticeBoard.notice.stakeUndelegated.subMessage',
    defaultMessage: '!!!TBD',
  },
  titleStakeRedelegated: {
    id: 'noticeBoard.notice.stakeRedelegated.title',
    defaultMessage: '!!!You have re-delegated to another pool {poolName}',
  },
  subMessageStakeRedelegated: {
    id: 'noticeBoard.notice.stakeRedelegated.subMessage',
    defaultMessage: '!!!Rewards for next two epochs will still be received from pool {poolName}',
  },
  titlefeeChanged: {
    id: 'noticeBoard.notice.feeChanged.title',
    defaultMessage: '!!!Stake pool fee has changed',
  },
  subMessagefeeChanged: {
    id: 'noticeBoard.notice.feeChanged.subMessage',
    defaultMessage: '!!!TBD',
  },
  titleCostChanged: {
    id: 'noticeBoard.notice.costChanged.title',
    defaultMessage: '!!!Stake pool cost has changed',
  },
  subMessageCostChanged: {
    id: 'noticeBoard.notice.costChanged.subMessage',
    defaultMessage: '!!!TBD',
  },
  titleRewardRecieved: {
    id: 'noticeBoard.notice.rewardRecieved.title',
    defaultMessage: '!!!Rewards have received',
  },
  subMessageRewardRecieved: {
    id: 'noticeBoard.notice.rewardRecieved.subMessage',
    defaultMessage: '!!!TBD',
  },
  titlePoolToRetire: {
    id: 'noticeBoard.notice.poolToRetire.title',
    defaultMessage: '!!!Pool {poolName} is planning to retire',
  },
  subMessagePoolToRetire: {
    id: 'noticeBoard.notice.poolToRetire.subMessage',
    defaultMessage: '!!!TBD',
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

export default class NoticeBlock extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  formatTime(notice: Notice, isToday: boolean): string {
    if (isToday) return moment(notice.date).fromNow();
    return moment(notice.date).format('HH:mm:ss');
  }

  render() {
    const { intl } = this.context;
    const { notice, isToday } = this.props;

    let icon;
    let title;
    let subMessage;
    const time = this.formatTime(notice, isToday);
    switch (notice.kind) {
      case NoticeKind.STAKE_DELEGATED:
        title = (
          <FormattedHTMLMessage
            {...messages.titleStakeDelegated}
            values={{ poolName: 'ZZZ' }}
          />);
        subMessage = intl.formatMessage(messages.subMessageStakeDelegated);
        icon = (<span><DelegatedIcon /></span>);
        break;
      case NoticeKind.STAKE_UNDELEGATED:
        title = (
          <FormattedHTMLMessage
            {...messages.titleStakeUndelegated}
            values={{ poolName: 'ZZZ' }}
          />);
        subMessage = intl.formatMessage(messages.subMessageStakeUndelegated);
        icon = (<span><UndelegatedIcon /></span>);
        break;
      case NoticeKind.STAKE_REDELEGATED:
        title = (
          <FormattedHTMLMessage
            {...messages.titleStakeRedelegated}
            values={{ poolName: 'YYY' }}
          />);
        subMessage =  (
          <FormattedHTMLMessage
            {...messages.subMessageStakeRedelegated}
            values={{ poolName: 'ZZZ' }}
          />);
        icon = (<span><RedelegatedIcon /></span>);
        break;
      case NoticeKind.FEE_CHANGED:
        title = intl.formatMessage(messages.titlefeeChanged);
        subMessage = intl.formatMessage(messages.subMessagefeeChanged);
        icon = (<span><FeeChangedIcon /></span>);
        break;
      case NoticeKind.COST_CHANGED:
        title = intl.formatMessage(messages.titleCostChanged);
        subMessage = intl.formatMessage(messages.subMessageCostChanged);
        icon = (<span><CostChangedIcon /></span>);
        break;
      case NoticeKind.REWARD_RECEIVED:
        title = intl.formatMessage(messages.titleRewardRecieved);
        subMessage = intl.formatMessage(messages.subMessageRewardRecieved);
        icon = (<span><RewardRecievedIcon /></span>);
        break;
      case NoticeKind.POOL_TO_RETIRE:
        title = (
          <FormattedHTMLMessage
            {...messages.titlePoolToRetire}
            values={{ poolName: 'ZZZ' }}
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
              <div className={styles.date}>{time}</div>
            </div>
            <div className={styles.secondRow}>{subMessage}</div>
          </div>
        </div>
        <div className={styles.line} />
      </div>
    );
  }
}
