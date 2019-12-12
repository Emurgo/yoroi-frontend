// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import type { InjectedProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import EpochProgress from '../../../components/wallet/staking/dashboard/EpochProgress';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import environment from '../../../environment';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';

import { formattedWalletAmount } from '../../../utils/formatters';

import {
  genTimeToSlot,
  genToRelativeSlotNumber,
  genCurrentSlotLength,
  genCurrentEpochLength,
} from '../../../api/ada/lib/storage/bridge/timeUtils';
import type {
  TimeToAbsoluteSlotFunc,
  ToRelativeSlotNumberFunc,
  CurrentSlotLengthFunc,
  CurrentEpochLengthFunc,
} from '../../../api/ada/lib/storage/bridge/timeUtils';

type Props = {
  ...InjectedProps,
};

type State = {|
  +currentTime: Date,
  +timeToSlot: TimeToAbsoluteSlotFunc;
  +toRelativeSlotNumber: ToRelativeSlotNumberFunc;
  +currentSlotLength: CurrentSlotLengthFunc;
  +currentEpochLength: CurrentEpochLengthFunc;
|};

@observer
export default class StakingDashboardPage extends Component<Props, State> {

  async componentDidMount() {
    const timeToSlot = await genTimeToSlot();
    const toRelativeSlotNumber = await genToRelativeSlotNumber();
    const currentSlotLength = await genCurrentSlotLength();
    const currentEpochLength = await genCurrentEpochLength();
    this.setState({
      timeToSlot,
      toRelativeSlotNumber,
      currentSlotLength,
      currentEpochLength,
      currentTime: new Date(),
    });
    setInterval(
      () => this.setState(prevState => ({
        ...prevState,
        currentTime: new Date()
      })),
      1000
    );

    this.props.actions.ada.delegation.startWatch.trigger();
  }

  componentWillUnmount() {
    this.props.actions.ada.delegation.reset.trigger();
  }

  render() {
    // TODO: render something else if there is a pending tx that modifies delegation?

    const publicDeriver = this.props.stores.substores[environment.API].wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }

    const delegationStore = this.props.stores.substores[environment.API].delegation;

    const hideOrFormat: BigNumber => string = (amount) => {
      return this.props.stores.profile.shouldHideBalance
        ? '******'
        : formattedWalletAmount(amount);
    };

    const epochProgress = this.getEpochProgress();

    const { getThemeVars } = this.props.stores.profile;
    return (
      <StakingDashboard
        themeVars={getThemeVars({ theme: 'YoroiModern' })}
        hasDelegation
        epochProgress={epochProgress}
        userSummary={<UserSummary
          totalAdaSum={hideOrFormat(publicDeriver.amount)}
          totalRewards={delegationStore.getDelegatedBalance.result == null
            ? undefined
            : hideOrFormat(
              delegationStore.getDelegatedBalance.result
                .accountPart
                .dividedBy(LOVELACES_PER_ADA)
            )}
          totalDelegated={
            delegationStore.getDelegatedBalance.result == null
              ? undefined
              : hideOrFormat(
                delegationStore.getDelegatedBalance.result.utxoPart.plus(
                  delegationStore.getDelegatedBalance.result.accountPart
                ).dividedBy(LOVELACES_PER_ADA)
              )}
        />}
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

  getEpochProgress: void => null | Node = () => {
    if (this.state == null) {
      return (<EpochProgress loading />);
    }

    const absoluteSlot = this.state.timeToSlot({
      time: this.state.currentTime
    });
    const relativeTime = this.state.toRelativeSlotNumber(absoluteSlot.slot);

    const epochLength = this.state.currentEpochLength();
    const slotLength = this.state.currentSlotLength();

    const secondsLeftInEpoch = (epochLength - relativeTime.slot) * slotLength;
    const timeLeftInEpoch = new Date(
      (1000 * secondsLeftInEpoch) - absoluteSlot.msIntoSlot
    );

    const leftPadDate: number => string = (num) => {
      if (num < 10) return '0' + num;
      return num.toString();
    };

    return (
      <EpochProgress
        currentEpoch={relativeTime.epoch}
        percentage={Math.floor(100 * relativeTime.slot / epochLength)}
        endTime={{
          h: leftPadDate(timeLeftInEpoch.getHours()),
          m: leftPadDate(timeLeftInEpoch.getMinutes()),
          s: leftPadDate(timeLeftInEpoch.getSeconds()),
        }}
      />
    );
  }
}
