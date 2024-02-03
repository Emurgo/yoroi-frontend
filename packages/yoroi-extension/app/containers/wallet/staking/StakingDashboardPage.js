// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';

import type { StoresAndActionsProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import UpcomingRewards from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import type { BoxInfo } from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import { digestForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import type { PoolTuples } from '../../../api/common/lib/storage/bridge/delegationUtils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type {
  ToRealTimeFunc,
  ToAbsoluteSlotNumberFunc,
  CurrentEpochLengthFunc,
  TimeSinceGenesisFunc,
} from '../../../api/common/lib/storage/bridge/timeUtils';

import globalMessages from '../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { getTokenName, genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../utils/formatters';
import { generateGraphData } from '../../../utils/graph';
import { maybe } from '../../../coreUtils';

@observer
export default class StakingDashboardPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable notificationElementId: string = '';

  async componentDidMount() {
    const timeStore = this.props.stores.substores.ada.time;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    await timeCalcRequests.requests.toAbsoluteSlot.execute().promise;
    await timeCalcRequests.requests.toRealTime.execute().promise;
    await timeCalcRequests.requests.currentEpochLength.execute().promise;
    await timeCalcRequests.requests.currentSlotLength.execute().promise;
    await timeCalcRequests.requests.timeSinceGenesis.execute().promise;
  }

  componentWillUnmount() {
    this.props.actions.ada.delegationTransaction.reset.trigger({ justTransaction: false });
  }

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const rewardInfo = this.getRewardInfo(publicDeriver);

    const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));
    const stakePools = errorIfPresent ?? this.getStakePools(publicDeriver);

    const showRewardAmount = errorIfPresent == null
      && this.props.stores.delegation.isExecutedDelegatedBalance(publicDeriver);

    const dashboard = (
      <StakingDashboard
        pageInfo={
          stakePools.pools == null
            ? undefined
            : {
                currentPage: this.props.stores.delegation.selectedPage,
                numPages: stakePools.pools.length,
                goToPage: page => this.props.actions.delegation.setSelectedPage.trigger(page),
              }
        }
        hasAnyPending={this.props.stores.transactions.hasAnyPending}
        stakePools={stakePools}
        userSummary={this._generateUserSummary({
          publicDeriver,
          showRewardAmount,
        })}
        upcomingRewards={rewardInfo?.rewardPopup}
        graphData={generateGraphData({
          delegationRequests,
          publicDeriver,
          currentEpoch: this.props.stores.substores.ada.time.getCurrentTimeRequests(publicDeriver)
            .currentEpoch,
          shouldHideBalance: this.props.stores.profile.shouldHideBalance,
          getLocalPoolInfo: this.props.stores.delegation.getLocalPoolInfo,
          tokenInfo: this.props.stores.tokenInfoStore.tokenInfo,
        })}
        isUnregistered={!this.props.stores.delegation.isStakeRegistered(publicDeriver)}
        epochLength={this.getEpochLengthInDays(publicDeriver)}
        ticker={truncateToken(
          getTokenName(
            this.props.stores.tokenInfoStore.getDefaultTokenInfo(
              publicDeriver.getParent().getNetworkInfo().NetworkId
            )
          )
        )}
      />
    );

    return (
      <>
        {this.getDialog(publicDeriver)}
        {dashboard}
      </>
    );
  }

  getEpochLengthInDays: (PublicDeriver<>) => ?number = publicDeriver => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    const getEpochLength = timeCalcRequests.requests.currentEpochLength.result;
    if (getEpochLength == null) return null;

    const getSlotLength = timeCalcRequests.requests.currentSlotLength.result;
    if (getSlotLength == null) return null;

    const epochLengthInSeconds = getEpochLength() * getSlotLength();
    const epochLengthInDays = epochLengthInSeconds / (60 * 60 * 24);
    return epochLengthInDays;
  };

  getRewardInfo: (
    PublicDeriver<>
  ) => void | {|
    rewardPopup: Node,
    showWarning: boolean,
  |} = publicDeriver => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    const currTimeRequests = timeStore.getCurrentTimeRequests(publicDeriver);
    const toAbsoluteSlot = timeCalcRequests.requests.toAbsoluteSlot.result;
    if (toAbsoluteSlot == null) return undefined;
    const toRealTime = timeCalcRequests.requests.toRealTime.result;
    if (toRealTime == null) return undefined;
    const timeSinceGenesis = timeCalcRequests.requests.timeSinceGenesis.result;
    if (timeSinceGenesis == null) return undefined;
    const getEpochLength = timeCalcRequests.requests.currentEpochLength.result;
    if (getEpochLength == null) return undefined;
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const isRegistered = this.props.stores.delegation.isStakeRegistered(publicDeriver);

    let rewardInfo = undefined;
    if (
      !(
        !delegationRequests.getCurrentDelegation.wasExecuted ||
        delegationRequests.getCurrentDelegation.isExecuting
      )
    ) {
      const { result } = delegationRequests.getCurrentDelegation;

      if (result == null || result.currEpoch == null) {
        rewardInfo = {
          rewardPopup: (
            <UpcomingRewards
              unregistered={isRegistered === false}
              useEndOfEpoch
              content={[
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                  timeSinceGenesis,
                  getEpochLength,
                  publicDeriver,
                  isCurrentEpoch: true,
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch + 1,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                  timeSinceGenesis,
                  getEpochLength,
                  publicDeriver,
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch + 2,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                  timeSinceGenesis,
                  getEpochLength,
                  publicDeriver,
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch + 3,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                  timeSinceGenesis,
                  getEpochLength,
                  publicDeriver,
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
        for (let i = 5; i >= 2; i--) {
          upcomingRewards.unshift(
            this.generateUpcomingRewardInfo({
              epoch: currTimeRequests.currentEpoch + i + 1,
              pools: isRegistered ? currEpochCert.pools : [],
              toAbsoluteSlot,
              toRealTime,
              timeSinceGenesis,
              getEpochLength,
              publicDeriver,
            })
          );
        }
        if (result.prevEpoch) {
          upcomingRewards.unshift(
            this.generateUpcomingRewardInfo({
              epoch: currTimeRequests.currentEpoch + 2,
              pools: isRegistered ? result.prevEpoch.pools : [],
              toAbsoluteSlot,
              toRealTime,
              timeSinceGenesis,
              getEpochLength,
              publicDeriver,
            })
          );
        }
        if (result.prevPrevEpoch) {
          upcomingRewards.unshift(
            this.generateUpcomingRewardInfo({
              epoch: currTimeRequests.currentEpoch + 1,
              pools: isRegistered ? result.prevPrevEpoch.pools : [],
              toAbsoluteSlot,
              toRealTime,
              timeSinceGenesis,
              getEpochLength,
              publicDeriver,
            })
          );
        }

        if (result.prevPrevPrevEpoch) {
          upcomingRewards.unshift(
            this.generateUpcomingRewardInfo({
              epoch: currTimeRequests.currentEpoch,
              pools: isRegistered ? result.prevPrevPrevEpoch.pools : [],
              toAbsoluteSlot,
              toRealTime,
              timeSinceGenesis,
              getEpochLength,
              publicDeriver,
              isCurrentEpoch: true,
            })
          );
        }

        const poolExplorerLink = this.props.stores.explorers.selectedExplorer
          .get(publicDeriver.getParent().getNetworkInfo().NetworkId)
          ?.getOrDefault('pool');

        const upcomingTuples = ((upcomingRewards.slice(0, 4): any): [
          ?BoxInfo,
          ?BoxInfo,
          ?BoxInfo,
          ?BoxInfo
        ]);
        const rewardPopup = (
          <UpcomingRewards
            unregistered={isRegistered === false}
            useEndOfEpoch
            content={upcomingTuples}
            showWarning={upcomingRewards.length === 4}
            onExternalLinkClick={handleExternalLinkClick}
            baseUrl={poolExplorerLink?.baseUrl}
          />
        );
        rewardInfo = {
          rewardPopup,
          showWarning: upcomingRewards.length === 4,
        };
      }
    }

    return (
      rewardInfo ?? {
        rewardPopup: (
          <UpcomingRewards
            unregistered={isRegistered === false}
            useEndOfEpoch
            content={[null, null, null, null]}
            showWarning={false}
            onExternalLinkClick={handleExternalLinkClick}
            baseUrl=""
          />
        ),
        showWarning: false,
      }
    );
  };

  generateUpcomingRewardInfo: ({|
    publicDeriver: PublicDeriver<>,
    epoch: number,
    pools: Array<PoolTuples>,
    toRealTime: ToRealTimeFunc,
    getEpochLength: CurrentEpochLengthFunc,
    toAbsoluteSlot: ToAbsoluteSlotNumberFunc,
    timeSinceGenesis: TimeSinceGenesisFunc,
    isCurrentEpoch?: boolean,
  |}) => BoxInfo = request => {
    const endEpochTime = request.toRealTime({
      absoluteSlotNum: request.toAbsoluteSlot({
        epoch: request.epoch,
        // Rewards are calculated at the start of the epoch but distributed at the end
        slot: request.getEpochLength(),
      }),
      timeSinceGenesisFunc: request.timeSinceGenesis,
    });
    const endEpochMoment = moment(endEpochTime);

    const miniPoolInfo = request.pools.map(pool => {
      const meta = this.props.stores.delegation.getLocalPoolInfo(
        request.publicDeriver.getParent().getNetworkInfo(),
        pool[0]
      );
      if (meta == null) {
        return { id: pool };
      }
      return { id: pool, ticker: meta.info?.ticker, name: meta.info?.name };
    });
    return {
      pools: miniPoolInfo,
      epoch: request.epoch,
      time: [
        endEpochMoment.format('MMM Do'),
        endEpochMoment.format('hh'),
        endEpochMoment.format('mm'),
        endEpochMoment.format('ss'),
        endEpochMoment.format('A'),
      ],
      isCurrentEpoch: request.isCurrentEpoch,
    };
  };

  getStakePools: (PublicDeriver<>) => {| pools: null | Array<Node | void> |} = publicDeriver => {
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }
    if (
      !delegationRequests.getDelegatedBalance.wasExecuted ||
      delegationRequests.getDelegatedBalance.isExecuting ||
      delegationRequests.getDelegatedBalance.result == null
    ) {
      return { pools: null };
    }
    if (delegationRequests.getDelegatedBalance.result.delegation == null) {
      return { pools: [] };
    }
    const currentPools = [
      [delegationRequests.getDelegatedBalance.result.delegation, 1]
    ];
    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const { uiNotifications } = this.props.stores;
    const { intl } = this.context;
    return {
      pools: currentPools.map(pool => {
        const meta = this.props.stores.delegation.getLocalPoolInfo(
          publicDeriver.getParent().getNetworkInfo(),
          pool[0]
        );
        if (meta == null) {
          // server hasn't returned information about the stake pool yet
          return undefined;
        }
        const name = meta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);

        const moreInfo =
          meta.info?.homepage != null
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
            purpose="dashboard"
            poolName={name}
            key={digestForHash(JSON.stringify(meta), 0)}
            data={stakePoolMeta}
            selectedExplorer={
              this.props.stores.explorers.selectedExplorer.get(
                publicDeriver.getParent().getNetworkInfo().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            hash={pool[0]}
            moreInfo={moreInfo}
            classicTheme={this.props.stores.profile.isClassicTheme}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                this.props.actions.notifications.open.trigger({
                  id: elementId,
                  duration: tooltipNotification.duration,
                  message: tooltipNotification.message,
                });
              }
            }}
            notification={
              this.notificationElementId == null
                ? null
                : uiNotifications.getTooltipActiveNotification(this.notificationElementId)
            }
            undelegate={undefined}
          />
        );
      }),
    };
  };

  getDialog: (PublicDeriver<>) => Node = publicDeriver => {
    const { actions, stores } = this.props;
    const uiDialogs = this.props.stores.uiDialogs;

    if (uiDialogs.isOpen(LessThanExpectedDialog)) {
      return (
        <LessThanExpectedDialog
          close={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
        />
      );
    }

    if (uiDialogs.isOpen(UnmangleTxDialogContainer)) {
      return (
        <UnmangleTxDialogContainer
          actions={actions}
          stores={stores}
          onClose={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
        />
      );
    }

    if (uiDialogs.isOpen(DeregisterDialogContainer)) {
      return (
        <DeregisterDialogContainer
          actions={actions}
          stores={stores}
          alwaysShowDeregister
          onNext={() => {
            // note: purposely don't await since the next dialog will properly render the spinner
            this.props.actions.ada.delegationTransaction.createWithdrawalTxForWallet.trigger({
              publicDeriver,
            });
            this.props.actions.dialogs.open.trigger({ dialog: WithdrawalTxDialogContainer });
          }}
        />
      );
    }
    if (uiDialogs.isOpen(WithdrawalTxDialogContainer)) {
      return (
        <WithdrawalTxDialogContainer
          actions={actions}
          stores={stores}
          onClose={() => {
            this.props.actions.ada.delegationTransaction.reset.trigger({
              justTransaction: false,
            });
            this.props.actions.dialogs.closeActiveDialog.trigger();
          }}
        />
      );
    }

    return null;
  };

  _generateUserSummary: ({|
    publicDeriver: PublicDeriver<>,
    showRewardAmount: boolean,
  |}) => Node = request => {

    const { publicDeriver, showRewardAmount } = request;
    const { stores } = this.props;

    const balance = this.props.stores.transactions.balance;
    const mangledAmounts = stores.delegation.getMangledAmountsOrZero(publicDeriver);
    const rewardBalance = this.props.stores.delegation.getRewardBalanceOrZero(publicDeriver);

    const stakeRegistered =
      this.props.stores.delegation.isStakeRegistered(publicDeriver) === true;

    const currentlyDelegating =
      this.props.stores.delegation.getDelegatedPoolId(publicDeriver) != null;

    return (
      <UserSummary
        canUnmangleSum={mangledAmounts.canUnmangle}
        cannotUnmangleSum={mangledAmounts.cannotUnmangle}
        defaultTokenInfo={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
          publicDeriver.getParent().getNetworkInfo().NetworkId
        )}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        onUnmangle={() =>
          this.props.actions.dialogs.open.trigger({
            dialog: UnmangleTxDialogContainer,
          })
        }
        totalSum={balance == null ? undefined : balance.joinAddCopy(rewardBalance)}
        totalRewards={showRewardAmount ? rewardBalance : undefined}
        openLearnMore={() =>
          this.props.actions.dialogs.open.trigger({
            dialog: LessThanExpectedDialog,
          })
        }
        withdrawRewards={
          stakeRegistered ? () => {
            this.props.actions.dialogs.open.trigger({ dialog: DeregisterDialogContainer });
          } : undefined
        }
        unitOfAccount={_entry => {
          // temporarily disabled
          return undefined;
          /*
          const tokenRow = this.props.stores.tokenInfoStore.tokenInfo
            .get(entry.networkId.toString())
            ?.get(entry.identifier);
          if (tokenRow == null) return undefined;

          if (!this.props.stores.profile.unitOfAccount.enabled) return undefined;
          const currency = this.props.stores.profile.unitOfAccount.currency;

          const shiftedAmount = entry.amount
            .shiftedBy(-tokenRow.Metadata.numberOfDecimals);

          const coinPrice = this.props.stores.coinPriceStore.getCurrentPrice(
            getTokenName(tokenRow),
            currency
          );
          if (coinPrice == null) return undefined;
          return {
            currency,
            amount: calculateAndFormatValue(shiftedAmount, coinPrice),
          };
          */
        }}
        shouldHideBalance={this.props.stores.profile.shouldHideBalance}
        isDelegated={
          showRewardAmount
          && stakeRegistered
          && currentlyDelegating
        }
      />
    );
  };
}
