// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import EpochProgress from './EpochProgress';
import UserSummary from './UserSummary';
import GraphWrapper from './GraphWrapper';
import StakePool from './StakePool';
import RewardPopup from './RewardPopup';
import EmptyDashboard from './EmptyDashboard';
import styles from './StakingDashboard.scss';

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
              <div className={styles.graphsWrapper}>
                <GraphWrapper themeVars={themeVars} tabs={['Total ADA', 'Margins', 'Rewards']} graphName="total" data={totalGraphData} />
                <GraphWrapper themeVars={themeVars} tabs={['Positions', 'Margins', 'Costs']} graphName="positions" data={positionsGraphData} />
              </div>
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
