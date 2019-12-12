// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';

import EpochProgress from './EpochProgress';
import UserSummary from './UserSummary';
import GraphWrapper from './GraphWrapper';
import StakePool from './StakePool';
import RewardPopup from './RewardPopup';
import EmptyDashboard from './EmptyDashboard';
import styles from './StakingDashboard.scss';
import globalMessages from '../../../../i18n/global-messages';

const messages = defineMessages({
  positionsLabel: {
    id: 'wallet.dashboard.graphType.positions',
    defaultMessage: '!!!Positions',
  },
  costsLabel: {
    id: 'wallet.dashboard.graphType.costs',
    defaultMessage: '!!!Costs',
  },
});

type Props = {|
  themeVars: Object,
  totalAdaSum: string,
  totalRewards: string,
  totalDelegated: string,
  currentEpoch: number,
  epochProgress: number,
  currentReward: string,
  followingReward: string,
  hasDelegation: bool,
  endTime: Object,
  stakePoolName: string,
  stakePoolData: Object,
  hash: string,
  totalGraphData: Array<Object>,
  positionsGraphData: Array<Object>,
|};

@observer
export default class StakingDashboard extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      themeVars,
      totalAdaSum,
      totalRewards,
      totalDelegated,
      currentEpoch,
      epochProgress,
      currentReward,
      followingReward,
      hasDelegation,
      endTime,
      stakePoolName,
      stakePoolData,
      hash,
      totalGraphData,
      positionsGraphData,
    } = this.props;

    const { intl } = this.context;

    // TODO: enable graphs eventually
    // eslint-disable-next-line no-unused-vars
    const graphs = (
      <div className={styles.graphsWrapper}>
        <GraphWrapper
          themeVars={themeVars}
          tabs={[
            intl.formatMessage(globalMessages.totalAdaLabel),
            intl.formatMessage(globalMessages.marginsLabel),
            intl.formatMessage(globalMessages.rewardsLabel),
          ]}
          graphName="total"
          data={totalGraphData}
        />
        <GraphWrapper
          themeVars={themeVars}
          tabs={[
            intl.formatMessage(messages.positionsLabel),
            intl.formatMessage(globalMessages.marginsLabel),
            intl.formatMessage(messages.costsLabel),
          ]}
          graphName="positions"
          data={positionsGraphData}
        />
      </div>
    );
    return (
      <div className={styles.page}>
        <div className={styles.contentWrap}>
          <div className={styles.rewards}>
            <RewardPopup currentText={currentReward} followingText={followingReward} />
          </div>
          <div className={styles.statsWrapper}>
            <EpochProgress
              currentEpoch={currentEpoch}
              percentage={epochProgress}
              endTime={endTime}
            />
            <div className={styles.summary}>
              <UserSummary
                totalAdaSum={totalAdaSum}
                totalRewards={totalRewards}
                totalDelegated={totalDelegated}
              />
            </div>
          </div>
          {hasDelegation ? (
            <div className={styles.bodyWrapper}>
              <div className={styles.stakePool}>
                <StakePool poolName={stakePoolName} data={stakePoolData} hash={hash} />
              </div>
            </div>
          ) : (
            <EmptyDashboard />
          )}
        </div>
      </div>
    );
  }

}
