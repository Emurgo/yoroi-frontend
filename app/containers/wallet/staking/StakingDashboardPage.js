// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import PublicDeriverWithCachedMeta from '../../../domain/PublicDeriverWithCachedMeta';
import { getOrDefault } from '../../../domain/Explorer';
import type { InjectedProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import EpochProgress from '../../../components/wallet/staking/dashboard/EpochProgress';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import UndelegateDialog from '../../../components/wallet/staking/dashboard/UndelegateDialog';
import Dialog from '../../../components/widgets/Dialog';
import { getShelleyTxFee } from '../../../api/ada/transactions/shelley/utils';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import UpcomingRewards from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import type { BoxInfo } from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import environment from '../../../environment';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';
import { digetForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import { GetPoolInfoApiError } from '../../../api/ada/errors';
import LocalizableError from '../../../i18n/LocalizableError';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import { formattedWalletAmount } from '../../../utils/formatters';
import type { PoolTuples } from '../../../api/ada/lib/state-fetch/types';
import type { DelegationRequests } from '../../../stores/ada/DelegationStore';

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
import { runInAction } from 'mobx';

type Props = {|
  ...InjectedProps,
|};

type State = {|
  +currentTime: Date,
  +notificationElementId: string,
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
      notificationElementId: '',
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
    this.props.actions[environment.API].delegationTransaction.reset.trigger();
  }

  hideOrFormat: BigNumber => string = (amount) => {
    return this.props.stores.profile.shouldHideBalance
      ? '******'
      : formattedWalletAmount(amount);
  };

  render() {
    if (this.state == null) {
      return null;
    }
    const publicDeriver = this.props.stores.substores[environment.API].wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }

    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getRequests(publicDeriver.self);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const getTimeBasedElements = this.getTimeBasedElements(publicDeriver);

    const errorIfPresent = this.getErrorInFetch(publicDeriver);
    const stakePools = errorIfPresent == null
      ? this.getStakePools(publicDeriver)
      : errorIfPresent;

    const { getThemeVars } = this.props.stores.profile;

    const dashboard = (
      <StakingDashboard
        pageInfo={
          delegationRequests.stakingKeyState == null ||
          !delegationRequests.getCurrentDelegation.wasExecuted ||
          delegationRequests.getCurrentDelegation.isExecuting
            ? undefined
            : {
              currentPage: delegationRequests.stakingKeyState.selectedPool,
              numPages: delegationRequests.stakingKeyState.state.delegation.pools.length,
              goToPage: page => runInAction(() => {
                if (delegationRequests.stakingKeyState) {
                  delegationRequests.stakingKeyState.selectedPool = page;
                }
              })
            }}
        hasAnyPending={this.props.stores.substores.ada.transactions.hasAnyPending}
        themeVars={getThemeVars({ theme: 'YoroiModern' })}
        stakePools={stakePools}
        epochProgress={getTimeBasedElements.epochProgress}
        userSummary={this._generateUserSummary({
          delegationRequests,
          publicDeriver,
          errorIfPresent,
        })}
        upcomingRewards={getTimeBasedElements.rewardInfo?.rewardPopup}
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

    const popup = this.generatePopupDialog();
    return (
      <>
        {popup}
        {this.getDialog()}
        {dashboard}
      </>);
  }

  generatePopupDialog: void => null | Node = () => {
    const { uiDialogs } = this.props.stores;
    const delegationTxStore = this.props.stores.substores[environment.API].delegationTransaction;

    const cancel = () => {
      this.props.actions.dialogs.closeActiveDialog.trigger();
      this.props.actions[environment.API].delegationTransaction.reset.trigger();
    };
    if (delegationTxStore.createDelegationTx.error != null) {
      const { intl } = this.context;

      return (
        <Dialog
          title={intl.formatMessage(globalMessages.errorLabel)}
          closeOnOverlayClick={false}
          classicTheme={this.props.stores.profile.isClassicTheme}
          onClose={cancel}
          closeButton={<DialogCloseButton onClose={cancel} />}
          actions={[{
            label: intl.formatMessage(globalMessages.backButtonLabel),
            onClick: cancel,
            primary: true,
          }]}
        >
          <>
            <center><InvalidURIImg /></center>
            <ErrorBlock
              error={delegationTxStore.createDelegationTx.error}
            />
          </>
        </Dialog>
      );
    }

    if (!uiDialogs.isOpen(UndelegateDialog)) {
      return null;
    }
    const delegationTx = delegationTxStore.createDelegationTx.result;
    if (delegationTx == null) {
      return null;
    }

    return (<UndelegateDialog
      onCancel={cancel}
      classicTheme={this.props.stores.profile.isClassicTheme}
      error={delegationTxStore.signAndBroadcastDelegationTx.error}
      onSubmit={async request => {
        await this.props.actions[environment.API]
          .delegationTransaction
          .signTransaction
          .trigger(request);
        cancel();
      }}
      isSubmitting={delegationTxStore.signAndBroadcastDelegationTx.isExecuting}
      transactionFee={getShelleyTxFee(delegationTx.unsignedTx.IOs, true)}
      staleTx={delegationTxStore.isStale}
    />);
  }

  getTimeBasedElements: PublicDeriverWithCachedMeta => {|
    epochProgress: Node,
    rewardInfo: void | {|
      rewardPopup: Node,
      showWarning: boolean,
    |},
  |} = (publicDeriver) => {
    if (this.state == null) {
      return {
        epochProgress: (<EpochProgress loading />),
        rewardInfo: undefined,
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
    const delegationRequests = delegationStore.getRequests(publicDeriver.self);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }
    let rewardInfo = undefined;
    if (!(
      !delegationRequests.getCurrentDelegation.wasExecuted ||
      delegationRequests.getCurrentDelegation.isExecuting
    )) {
      const { result } = delegationRequests.getCurrentDelegation;
      if (result == null || result.currEpoch == null) {
        rewardInfo = {
          rewardPopup: (
            <UpcomingRewards
              content={[
                this.generateUpcomingRewardInfo({
                  epoch: currentRelativeTime.epoch + 1,
                  pools: [],
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currentRelativeTime.epoch + 2,
                  pools: [],
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currentRelativeTime.epoch + 3,
                  pools: [],
                }),
              ]}
              showWarning={false}
              onExternalLinkClick={handleExternalLinkClick}
              baseUrl=""
            />
          ),
          showWarning: false,
        };
      } else {
        const currEpochCert = result.currEpoch;

        // first reward is slower than the rest
        // it takes 2 epochs for stake delegation to update
        // then after the start of the 3rd epoch, you get the reward
        const upcomingRewards: Array<BoxInfo> = [];
        for (let i = 4; i >= 2; i--) {
          upcomingRewards.unshift(this.generateUpcomingRewardInfo({
            epoch: currentRelativeTime.epoch + i + 1,
            pools: currEpochCert.pools,
          }));
        }
        if (result.prevEpoch) {
          upcomingRewards.unshift(this.generateUpcomingRewardInfo({
            epoch: currentRelativeTime.epoch + 2,
            pools: result.prevEpoch.pools,
          }));
        }
        if (result.prevPrevEpoch) {
          upcomingRewards.unshift(this.generateUpcomingRewardInfo({
            epoch: currentRelativeTime.epoch + 1,
            pools: result.prevPrevEpoch.pools,
          }));
        }

        const { baseUrl } = getOrDefault(this.props.stores.profile.selectedExplorer, 'pool');
        const upcomingTuples = ((upcomingRewards.slice(0, 3): any): [?BoxInfo, ?BoxInfo, ?BoxInfo]);
        const rewardPopup = (
          <UpcomingRewards
            content={upcomingTuples}
            showWarning={upcomingRewards.length === 3}
            onExternalLinkClick={handleExternalLinkClick}
            baseUrl={baseUrl}
          />
        );
        rewardInfo = {
          rewardPopup,
          showWarning: upcomingRewards.length === 3,
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
      rewardInfo: rewardInfo ?? ({
        rewardPopup: (
          <UpcomingRewards
            content={[null, null, null]}
            showWarning={false}
            onExternalLinkClick={handleExternalLinkClick}
            baseUrl=""
          />
        ),
        showWarning: false,
      }),
    };
  }

  generateUpcomingRewardInfo: {|
    epoch: number,
    pools: Array<PoolTuples>,
  |} => BoxInfo = (request) => {
    const endEpochTime = this.toRealTime({
      absoluteSlotNum: this.toAbsoluteSlot({
        epoch: request.epoch,
        slot: 0,
      })
    });
    const endEpochMoment = moment(endEpochTime);
    return {
      pools: request.pools,
      epoch: request.epoch,
      time: [
        endEpochMoment.format('MMM Do'),
        endEpochMoment.format('hh'),
        endEpochMoment.format('mm'),
        endEpochMoment.format('ss'),
        endEpochMoment.format('A'),
      ],
    };
  }

  getErrorInFetch: PublicDeriverWithCachedMeta => void | {| error: LocalizableError, |} = (
    publicDeriver
  ) => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getRequests(publicDeriver.self);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }
    if (delegationRequests.error != null) {
      return { error: delegationRequests.error };
    }
    const keyState = delegationRequests.stakingKeyState;
    if (
      keyState &&
      keyState.state.delegation.pools.length === 0 &&
      delegationRequests.getCurrentDelegation.result != null
    ) {
      const currentDelegation = delegationRequests.getCurrentDelegation.result;
      const currEpochInfo = currentDelegation.currEpoch;
      if (currEpochInfo == null) {
        return undefined;
      }
      if (currEpochInfo.pools.length !== 0) {
        return { error: new GetPoolInfoApiError() };
      }
    }
    return undefined;
  }

  getStakePools: PublicDeriverWithCachedMeta => {| pools: null | Array<Node> |} = (
    publicDeriver
  ) => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getRequests(publicDeriver.self);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }
    if (
      !delegationRequests.getCurrentDelegation.wasExecuted ||
      delegationRequests.getCurrentDelegation.isExecuting
    ) {
      return { pools: null };
    }
    if (delegationRequests.stakingKeyState == null) {
      return { pools: [] };
    }
    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const { uiNotifications, } = this.props.stores;
    const keyState = delegationRequests.stakingKeyState;
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
            selectedExplorer={this.props.stores.profile.selectedExplorer}
            hash={pool[0]}
            moreInfo={moreInfo}
            classicTheme={this.props.stores.profile.isClassicTheme}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                this.setState({ notificationElementId: elementId });
                this.props.actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={uiNotifications.getTooltipActiveNotification(
              this.state.notificationElementId
            )}
            undelegate={
              // don't support undelegation for ratio stake since it's a less intuitive UX
              keyState.state.delegation.pools.length === 1
                ? async () => {
                  await this.props.actions[environment.API]
                    .delegationTransaction
                    .createTransaction
                    .trigger({
                      publicDeriver,
                      poolRequest: undefined,
                    });
                  this.props.actions.dialogs.open.trigger({ dialog: UndelegateDialog });
                }
                : undefined
            }
            isUndelegating={
              this.props.stores.substores[environment.API]
                .delegationTransaction
                .createDelegationTx
                .isExecuting
            }
          />
        );
      })
    };
  }

  getDialog: void => Node = () => {
    if (this.props.stores.uiDialogs.isOpen(LessThanExpectedDialog)) {
      return (
        <LessThanExpectedDialog
          close={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />
      );
    }

    if (this.props.stores.uiDialogs.isOpen(UnmangleTxDialogContainer)) {
      return (
        <UnmangleTxDialogContainer
          actions={this.props.actions}
          stores={this.props.stores}
          onClose={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
        />
      );
    }

    return null;
  }

  _generateUserSummary: {|
    delegationRequests: DelegationRequests,
    publicDeriver: PublicDeriverWithCachedMeta,
    errorIfPresent: void | {| error: LocalizableError |}
  |} => Node = (request) => {
    const showRewardAmount = request.delegationRequests.getCurrentDelegation.wasExecuted &&
      request.delegationRequests.getDelegatedBalance.wasExecuted &&
      request.errorIfPresent == null;

    const {
      canUnmangle,
      cannotUnmangle,
    } = this.props.stores.substores.ada.addresses.getUnmangleAmounts();

    const canUnmangleSum = canUnmangle.reduce(
      (sum, val) => sum.plus(val),
      new BigNumber(0)
    );
    const cannotUnmangleSum = cannotUnmangle.reduce(
      (sum, val) => sum.plus(val),
      new BigNumber(0)
    );

    return (
      <UserSummary
        canUnmangleSum={canUnmangleSum}
        cannotUnmangleSum={cannotUnmangleSum}
        onUnmangle={() => this.props.actions.dialogs.open.trigger({
          dialog: UnmangleTxDialogContainer,
        })}
        totalAdaSum={request.publicDeriver.amount == null
          ? undefined
          : this.hideOrFormat(request.publicDeriver.amount)
        }
        totalRewards={
          !showRewardAmount || request.delegationRequests.getDelegatedBalance.result == null
            ? undefined
            : this.hideOrFormat(
              request.delegationRequests.getDelegatedBalance.result
                .accountPart
                .dividedBy(LOVELACES_PER_ADA)
            )
        }
        openLearnMore={() => this.props.actions.dialogs.open.trigger({
          dialog: LessThanExpectedDialog,
        })}
        totalDelegated={
          !showRewardAmount || request.delegationRequests.getDelegatedBalance.result == null
            ? undefined
            : this.hideOrFormat(
              request.delegationRequests.getDelegatedBalance.result.utxoPart.plus(
                request.delegationRequests.getDelegatedBalance.result.accountPart
              ).dividedBy(LOVELACES_PER_ADA)
            )}
      />
    );
  }
}
