// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import type { InjectedProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';

type Props = {
  ...InjectedProps,
};

@observer
export default class StakingDashboardPage extends Component<Props> {

  render() {
    const { getThemeVars } = this.props.stores.profile;
    return (
      <StakingDashboard
        themeVars={getThemeVars({ theme: 'YoroiModern' })}
        hasDelegation
        endTime={{ h: '07', m: '10', s: '55' }}
        totalAdaSum="100,000.000000"
        totalRewards="0"
        totalDelegated="0"
        currentEpoch={5}
        epochProgress={55}
        currentReward="Tue, 13th at 18:30:27"
        followingReward="every 2 days"
        stakePoolName={"Warren's stake pool"}
        stakePoolData={{
          percentage: '30',
          fullness: '18',
          margins: '12',
          created: '29/02/2019 12:42:41 PM',
          cost: '12,688.00000',
          stake: '9,688.00000',
          pledge: '85.567088',
          rewards: '81.000088',
          age: '23',
        }}
        hash="addr1ssuvzjs82mshgvyp4r4lmwgknvgjswnm7mpcq3wycjj7v2nk393e6qwqr79etp5e4emf5frwj7zakknsuq3ewl4yhptdlt8j8s3ngm9078ssez"
        totalGraphData={[
          {
            name: 1,
            ada: 4000,
            rewards: 2400,
          },
          {
            name: 2,
            ada: 3000,
            rewards: 1398,
          },
          {
            name: 3,
            ada: 2000,
            rewards: 9000,
          },
          {
            name: 4,
            ada: 2780,
            rewards: 3908,
          },
          {
            name: 5,
            ada: 1890,
            rewards: 4800,
          },
          {
            name: 6,
            ada: 2390,
            rewards: 3800,
          },
          {
            name: 7,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 8,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 9,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 10,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 11,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 12,
            ada: 4000,
            rewards: 2400,
          },
          {
            name: 13,
            ada: 3000,
            rewards: 1398,
          },
          {
            name: 14,
            ada: 2000,
            rewards: 9000,
          },
          {
            name: 15,
            ada: 2780,
            rewards: 3908,
          },
          {
            name: 16,
            ada: 1890,
            rewards: 4800,
          },
          {
            name: 17,
            ada: 2390,
            rewards: 3800,
          },
          {
            name: 18,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 19,
            ada: 3490,
            rewards: 4300,
          },
        ]}
        positionsGraphData={[
          {
            name: 1,
            ada: 1200,
            rewards: 8294,
          },
          {
            name: 2,
            ada: 1000,
            rewards: 6000,
          },
          {
            name: 3,
            ada: 800,
            rewards: 5789,
          },
          {
            name: 4,
            ada: 2780,
            rewards: 3908,
          },
          {
            name: 5,
            ada: 1890,
            rewards: 4800,
          },
          {
            name: 6,
            ada: 2000,
            rewards: 4000,
          },
          {
            name: 7,
            ada: 3490,
            rewards: 4000,
          },
          {
            name: 8,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 9,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 10,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 11,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 12,
            ada: 4000,
            rewards: 2400,
          },
          {
            name: 13,
            ada: 3000,
            rewards: 1398,
          },
          {
            name: 14,
            ada: 1400,
            rewards: 3000,
          },
          {
            name: 15,
            ada: 2780,
            rewards: 3908,
          },
          {
            name: 16,
            ada: 1890,
            rewards: 4800,
          },
          {
            name: 17,
            ada: 2390,
            rewards: 3800,
          },
          {
            name: 18,
            ada: 3490,
            rewards: 4300,
          },
          {
            name: 19,
            ada: 3490,
            rewards: 14590,
          },
        ]}
      />
    );
  }
}
