// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import type { InjectedProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import EpochProgress from '../../../components/wallet/staking/dashboard/EpochProgress';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import RewardPopup from '../../../components/wallet/staking/dashboard/RewardPopup';
import environment from '../../../environment';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';
import { digetForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import { GetPoolInfoApiError } from '../../../api/ada/errors';
import LocalizableError from '../../../i18n/LocalizableError';

import { formattedWalletAmount } from '../../../utils/formatters';

import {
  genTimeToSlot,
  genToRelativeSlotNumber,
  genToAbsoluteSlotNumber,
  genToRealTime,
  genCurrentSlotLength,
  genCurrentEpochLength,
} from '../../../api/ada/lib/storage/bridge/timeUtils';
import type {
  TimeToAbsoluteSlotFunc,
  ToRelativeSlotNumberFunc,
  ToRealTimeFunc,
  ToAbsoluteSlotNumberFunc,
  CurrentSlotLengthFunc,
  CurrentEpochLengthFunc,
} from '../../../api/ada/lib/storage/bridge/timeUtils';
import globalMessages from '../../../i18n/global-messages';

type Props = {
  ...InjectedProps,
};

type State = {|
  +currentTime: Date,
|};

@observer
export default class StakingDashboardPage extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  intervalId: void | IntervalID;

  timeToSlot: TimeToAbsoluteSlotFunc;
  toRelativeSlotNumber: ToRelativeSlotNumberFunc;
  toRealTime: ToRealTimeFunc;
  toAbsoluteSlot: ToAbsoluteSlotNumberFunc;
  currentSlotLength: CurrentSlotLengthFunc;
  currentEpochLength: CurrentEpochLengthFunc;

  async componentDidMount() {
    this.timeToSlot = await genTimeToSlot();
    this.toRelativeSlotNumber = await genToRelativeSlotNumber();
    this.toRealTime = await genToRealTime();
    this.toAbsoluteSlot = await genToAbsoluteSlotNumber();
    this.currentSlotLength = await genCurrentSlotLength();
    this.currentEpochLength = await genCurrentEpochLength();
    this.setState({
      currentTime: new Date(),
    });
    this.intervalId = setInterval(
      () => this.setState({
        currentTime: new Date()
      }),
      1000
    );
  }

  componentWillUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  render() {
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

    const getTimeBasedElements = this.getTimeBasedElements();

    const errorIfPresent = this.getErrorInFetch();
    const stakePools = errorIfPresent == null
      ? this.getStakePools()
      : errorIfPresent;

    const showRewardAmount = delegationStore.getCurrentDelegation.wasExecuted &&
      delegationStore.getDelegatedBalance.wasExecuted &&
      errorIfPresent == null;

    const { getThemeVars } = this.props.stores.profile;
    return (
      <StakingDashboard
        hasAnyPending={this.props.stores.substores.ada.transactions.hasAnyPending}
        themeVars={getThemeVars({ theme: 'YoroiModern' })}
        stakePools={stakePools}
        epochProgress={getTimeBasedElements.epochProgress}
        userSummary={<UserSummary
          totalAdaSum={publicDeriver.amount == null
            ? undefined
            : hideOrFormat(publicDeriver.amount)
          }
          totalRewards={
            !showRewardAmount || delegationStore.getDelegatedBalance.result == null
              ? undefined
              : hideOrFormat(
                delegationStore.getDelegatedBalance.result
                  .accountPart
                  .dividedBy(LOVELACES_PER_ADA)
              )
          }
          totalDelegated={
            !showRewardAmount || delegationStore.getDelegatedBalance.result == null
              ? undefined
              : hideOrFormat(
                delegationStore.getDelegatedBalance.result.utxoPart.plus(
                  delegationStore.getDelegatedBalance.result.accountPart
                ).dividedBy(LOVELACES_PER_ADA)
              )}
        />}
        rewardPopup={getTimeBasedElements.rewardPopup}
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

  getTimeBasedElements: void => {|
    epochProgress: Node,
    rewardPopup: void | Node,
  |} = () => {
    if (this.state == null) {
      return {
        epochProgress: (<EpochProgress loading />),
        rewardPopup: undefined,
      };
    }

    const currentAbsoluteSlot = this.timeToSlot({
      time: this.state.currentTime
    });
    const currentRelativeTime = this.toRelativeSlotNumber(currentAbsoluteSlot.slot);

    const epochLength = this.currentEpochLength();
    const slotLength = this.currentSlotLength();

    const secondsLeftInEpoch = (epochLength - currentRelativeTime.slot) * slotLength;
    const timeLeftInEpoch = new Date(
      (1000 * secondsLeftInEpoch) - currentAbsoluteSlot.msIntoSlot
    );

    const leftPadDate: number => string = (num) => {
      if (num < 10) return '0' + num;
      return num.toString();
    };

    const delegationStore = this.props.stores.substores[environment.API].delegation;
    let rewardInfo = undefined;
    if (
      !delegationStore.getCurrentDelegation.wasExecuted ||
      delegationStore.getCurrentDelegation.isExecuting
    ) {
      rewardInfo = undefined;
    } else {
      const { result } = delegationStore.getCurrentDelegation;
      if (result == null || result.block == null) {
        rewardInfo = undefined;
      } else {
        const block = result.block;
        const certificateRelativeTime = this.toRelativeSlotNumber(block.SlotNum);

        let nextRewardEpoch;
        const epochsSinceCert = currentRelativeTime.epoch - certificateRelativeTime.epoch;
        // first reward is slower than the rest
        // it takes 2 epochs for stake delegation to update
        // then after the start of the 3rd epoch, you get the reward
        if (epochsSinceCert === 0) {
          nextRewardEpoch = currentRelativeTime.epoch + 3;
        } else if (epochsSinceCert === 1) {
          nextRewardEpoch = currentRelativeTime.epoch + 2;
        } else {
          nextRewardEpoch = currentRelativeTime.epoch + 1;
        }
        const nextRewardTime = this.toRealTime({
          absoluteSlotNum: this.toAbsoluteSlot({
            epoch: nextRewardEpoch,
            slot: 0,
          })
        });
        const followingRewardTime = this.toRealTime({
          absoluteSlotNum: this.toAbsoluteSlot({
            epoch: nextRewardEpoch + 1,
            slot: 0,
          })
        });
        const rewardPopup = (
          <RewardPopup
            currentText={moment(nextRewardTime).format('MMM Do hh:mm A')}
            followingText={moment(followingRewardTime).format('MMM Do hh:mm A')}
            showDisclaimer={epochsSinceCert <= 1}
          />
        );
        rewardInfo = {
          rewardPopup,
          showWarning: epochsSinceCert <= 1,
        };
      }
    }

    const epochProgress = (
      <EpochProgress
        currentEpoch={currentRelativeTime.epoch}
        percentage={Math.floor(100 * currentRelativeTime.slot / epochLength)}
        endTime={{
          h: leftPadDate(timeLeftInEpoch.getUTCHours()),
          m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
          s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
        }}
        showTooltip={rewardInfo != null && rewardInfo.showWarning}
      />
    );

    return {
      epochProgress,
      rewardPopup: rewardInfo?.rewardPopup,
    };
  }

  getErrorInFetch: void => void | {| error: LocalizableError, |} = () => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    if (delegationStore.error != null) {
      return { error: delegationStore.error };
    }
    const keyState = delegationStore.stakingKeyState;
    if (
      keyState &&
      keyState.state.delegation.pools.length === 0 &&
      delegationStore.getCurrentDelegation.result != null
    ) {
      return { error: new GetPoolInfoApiError() };
    }
    return undefined;
  }

  getStakePools: void => {| pools: null | Array<Node> |} = () => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    if (
      !delegationStore.getCurrentDelegation.wasExecuted ||
      delegationStore.getCurrentDelegation.isExecuting
    ) {
      return { pools: null };
    }
    if (delegationStore.stakingKeyState == null) {
      return { pools: [] };
    }
    const keyState = delegationStore.stakingKeyState;
    const { intl } = this.context;
    return {
      pools: keyState.state.delegation.pools.map(pool => {
        const meta = keyState.poolInfo.get(pool[0]);
        if (meta == null) {
          throw new Error(`${nameof(this.getStakePools)} no meta for ${pool[0]}`);
        }
        const name = meta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);

        const moreInfo = meta.info?.homepage != null
          ? {
            openPoolPage: handleExternalLinkClick,
            url: meta.info.homepage,
          }
          : undefined;

        // TODO: implement this eventually
        const stakePoolMeta = {
          // percentage: '30',
          // fullness: '18',
          // margins: '12',
          // created: '29/02/2019 12:42:41 PM',
          // cost: '12,688.00000',
          // stake: '9,688.00000',
          // pledge: '85.567088',
          // rewards: '81.000088',
          // age: '23',
        };
        return (
          <StakePool
            poolName={name}
            key={digetForHash(JSON.stringify(meta), 0)}
            data={stakePoolMeta}
            hash={pool[0]}
            moreInfo={moreInfo}
            classicTheme={this.props.stores.profile.isClassicTheme}
          />
        );
      })
    };
  }
}
