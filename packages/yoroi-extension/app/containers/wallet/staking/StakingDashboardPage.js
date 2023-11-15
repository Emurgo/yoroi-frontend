// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import UpcomingRewards from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import type { BoxInfo } from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import { digestForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import LocalizableError from '../../../i18n/LocalizableError';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import type { PoolTuples } from '../../../api/common/lib/storage/bridge/delegationUtils';
import type { PoolMeta, DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import type { AdaDelegationRequests } from '../../../stores/ada/AdaDelegationStore';
import EpochProgressContainer from './EpochProgressContainer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type {
  ToRealTimeFunc,
  ToAbsoluteSlotNumberFunc,
  CurrentEpochLengthFunc,
  TimeSinceGenesisFunc,
} from '../../../api/common/lib/storage/bridge/timeUtils';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type {
  CurrentTimeRequests,
  TimeCalcRequests,
} from '../../../stores/base/BaseCardanoTimeStore';
import type { Notification } from '../../../types/notificationType';

import globalMessages from '../../../i18n/global-messages';
import { computed, observable, runInAction } from 'mobx';
import { ApiOptions, getApiForNetwork, } from '../../../api/common/utils';
import type { NetworkRow, TokenRow, } from '../../../api/ada/lib/storage/database/primitives/tables';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import type { GeneratedData as DeregisterDialogContainerData } from '../../transfer/DeregisterDialogContainer';
import type { GeneratedData as WithdrawalTxDialogContainerData } from '../../transfer/WithdrawalTxDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import { getTokenName, genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../utils/formatters';
import { generateGraphData } from '../../../utils/graph';

export type GeneratedData = typeof StakingDashboardPage.prototype.generated;

type Props = InjectedOrGenerated<GeneratedData>;

@observer
export default class StakingDashboardPage extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable notificationElementId: string = '';

  async componentDidMount() {
    const timeStore = this.generated.stores.time;
    const publicDeriver = this.generated.stores.wallets.selected;
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
    this.generated.actions.ada.delegationTransaction.reset.trigger({ justTransaction: false });
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }
    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const rewardInfo = this.getRewardInfo(publicDeriver);

    const errorIfPresent = this.getErrorInFetch(publicDeriver);
    const stakePools = errorIfPresent == null ? this.getStakePools(publicDeriver) : errorIfPresent;

    const dashboard = (
      <StakingDashboard
        pageInfo={
          stakePools.pools == null
            ? undefined
            : {
                currentPage: this.generated.stores.delegation.selectedPage,
                numPages: stakePools.pools.length,
                goToPage: page => this.generated.actions.delegation.setSelectedPage.trigger(page),
              }
        }
        hasAnyPending={this.generated.stores.transactions.hasAnyPending}
        stakePools={stakePools}
        userSummary={this._generateUserSummary({
          delegationRequests,
          publicDeriver,
          errorIfPresent,
        })}
        upcomingRewards={rewardInfo?.rewardPopup}
        graphData={generateGraphData({
          delegationRequests,
          publicDeriver,
          currentEpoch:
            this.generated.stores.time.getCurrentTimeRequests(publicDeriver).currentEpoch,
          shouldHideBalance: this.generated.stores.profile.shouldHideBalance,
          getLocalPoolInfo: this.generated.stores.delegation.getLocalPoolInfo,
          tokenInfo: this.generated.stores.tokenInfoStore.tokenInfo,
        })}
        isUnregistered={!this._isRegistered(publicDeriver)}
        epochLength={this.getEpochLengthInDays(publicDeriver)}
        ticker={truncateToken(getTokenName(
          this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          )
        ))}
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
    const timeStore = this.generated.stores.time;
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
    const timeStore = this.generated.stores.time;
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
    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const isRegistered = this._isRegistered(publicDeriver);

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

        const poolExplorerLink = this.generated.stores.explorers.selectedExplorer
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
      const meta = this.generated.stores.delegation.getLocalPoolInfo(
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

  getErrorInFetch: (PublicDeriver<>) => void | {| error: LocalizableError |} = publicDeriver => {
    const delegationStore = this.generated.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }
    if (delegationRequests.error != null) {
      return { error: delegationRequests.error };
    }
    return undefined;
  };

  getStakePools: (PublicDeriver<>) => {| pools: null | Array<Node | void> |} = publicDeriver => {
    const delegationStore = this.generated.stores.delegation;
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

    const { uiNotifications } = this.generated.stores;
    const { intl } = this.context;
    return {
      pools: currentPools.map(pool => {
        const meta = this.generated.stores.delegation.getLocalPoolInfo(
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
              this.generated.stores.explorers.selectedExplorer.get(
                publicDeriver.getParent().getNetworkInfo().NetworkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            hash={pool[0]}
            moreInfo={moreInfo}
            classicTheme={this.generated.stores.profile.isClassicTheme}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                this.generated.actions.notifications.open.trigger({
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
    const uiDialogs = this.generated.stores.uiDialogs;

    if (uiDialogs.isOpen(LessThanExpectedDialog)) {
      return (
        <LessThanExpectedDialog
          close={() => this.generated.actions.dialogs.closeActiveDialog.trigger()}
        />
      );
    }

    if (uiDialogs.isOpen(UnmangleTxDialogContainer)) {
      return (
        <UnmangleTxDialogContainer
          {...this.generated.UnmangleTxDialogContainerProps}
          onClose={() => this.generated.actions.dialogs.closeActiveDialog.trigger()}
        />
      );
    }

    if (uiDialogs.isOpen(DeregisterDialogContainer)) {
      return (
        <DeregisterDialogContainer
          {...this.generated.DeregisterDialogContainerProps}
          alwaysShowDeregister
          onNext={() => {
            // note: purposely don't await since the next dialog will properly render the spinner
            this.generated.actions.ada.delegationTransaction.createWithdrawalTxForWallet.trigger({
              publicDeriver,
            });
            this.generated.actions.dialogs.open.trigger({ dialog: WithdrawalTxDialogContainer });
          }}
        />
      );
    }
    if (uiDialogs.isOpen(WithdrawalTxDialogContainer)) {
      return (
        <WithdrawalTxDialogContainer
          {...this.generated.WithdrawalTxDialogContainerProps}
          onClose={() => {
            this.generated.actions.ada.delegationTransaction.reset.trigger({
              justTransaction: false,
            });
            this.generated.actions.dialogs.closeActiveDialog.trigger();
          }}
        />
      );
    }

    return null;
  };

  _generateUserSummary: ({|
    delegationRequests: DelegationRequests,
    publicDeriver: PublicDeriver<>,
    errorIfPresent: void | {| error: LocalizableError |},
  |}) => Node = request => {
    const showRewardAmount =
      request.delegationRequests.getDelegatedBalance.wasExecuted &&
      request.errorIfPresent == null;

    const unmangledAmountsRequest = request.delegationRequests.mangledAmounts.result;

    const defaultToken = request.publicDeriver.getParent().getDefaultToken();

    const balance = this.generated.stores.transactions.balance;

    const rewardBalance =
      request.delegationRequests.getDelegatedBalance.result == null
        ? new MultiToken([], defaultToken)
        : request.delegationRequests.getDelegatedBalance.result.accountPart;

    const currentlyDelegating =
      request.delegationRequests.getDelegatedBalance.result?.delegation != null;

    return (
      <UserSummary
        canUnmangleSum={unmangledAmountsRequest?.canUnmangle ?? new MultiToken([], defaultToken)}
        cannotUnmangleSum={
          unmangledAmountsRequest?.cannotUnmangle ?? new MultiToken([], defaultToken)
        }
        defaultTokenInfo={
          this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
            request.publicDeriver.getParent().getNetworkInfo().NetworkId
          )
        }
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        onUnmangle={() =>
          this.generated.actions.dialogs.open.trigger({
            dialog: UnmangleTxDialogContainer,
          })
        }
        totalSum={
          balance == null
            ? undefined
            : balance.joinAddCopy(rewardBalance)
        }
        totalRewards={
          !showRewardAmount || request.delegationRequests.getDelegatedBalance.result == null
            ? undefined
            : request.delegationRequests.getDelegatedBalance.result.accountPart
        }
        openLearnMore={() =>
          this.generated.actions.dialogs.open.trigger({
            dialog: LessThanExpectedDialog,
          })
        }
        withdrawRewards={
          this._isRegistered(request.publicDeriver) === true
            ? () => {
                this.generated.actions.dialogs.open.trigger({ dialog: DeregisterDialogContainer });
              }
            : undefined
        }
        unitOfAccount={_entry => {
          // temporarily disabled
          return undefined;
          /*
          const tokenRow = this.generated.stores.tokenInfoStore.tokenInfo
            .get(entry.networkId.toString())
            ?.get(entry.identifier);
          if (tokenRow == null) return undefined;

          if (!this.generated.stores.profile.unitOfAccount.enabled) return undefined;
          const currency = this.generated.stores.profile.unitOfAccount.currency;

          const shiftedAmount = entry.amount
            .shiftedBy(-tokenRow.Metadata.numberOfDecimals);

          const coinPrice = this.generated.stores.coinPriceStore.getCurrentPrice(
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
        shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
        isDelegated={
          showRewardAmount &&
          request.delegationRequests.getDelegatedBalance.result !== null &&
          currentlyDelegating &&
          this._isRegistered(request.publicDeriver) === true
        }
      />
    );
  };

  _isRegistered: (PublicDeriver<>) => ?boolean = publicDeriver => {
    if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
      return undefined;
    }
    const delegationRequests = this.generated.stores.delegation.getDelegationRequests(
      publicDeriver
    );
    if (delegationRequests == null) return undefined;
    if (
      !delegationRequests.getDelegatedBalance.wasExecuted ||
      delegationRequests.getDelegatedBalance.isExecuting ||
      delegationRequests.getDelegatedBalance.result == null
    ) {
      return undefined;
    }
    return delegationRequests.getDelegatedBalance.result.stakeRegistered;
  };

  @computed get generated(): {|
    UnmangleTxDialogContainerProps: InjectedOrGenerated<UnmangleTxDialogContainerData>,
    DeregisterDialogContainerProps: InjectedOrGenerated<DeregisterDialogContainerData>,
    WithdrawalTxDialogContainerProps: InjectedOrGenerated<WithdrawalTxDialogContainerData>,
    actions: {|
      ada: {|
        delegationTransaction: {|
          reset: {| trigger: (params: {| justTransaction: boolean |}) => void |},
          createWithdrawalTxForWallet: {|
            trigger: (params: {| publicDeriver: PublicDeriver<> |}) => Promise<void>,
          |},
        |},
      |},
      delegation: {|
        setSelectedPage: {|
          trigger: (params: number) => void,
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        open: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
      notifications: {|
        open: {| trigger: (params: Notification) => void |},
      |},
    |},
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        isClassicTheme: boolean,
        shouldHideBalance: boolean,
        unitOfAccount: UnitOfAccountSettingType,
      |},
      delegation: {|
        selectedPage: number,
        getLocalPoolInfo: ($ReadOnly<NetworkRow>, string) => void | PoolMeta,
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
      time: {|
        getCurrentTimeRequests: (PublicDeriver<>) => CurrentTimeRequests,
        getTimeCalcRequests: (PublicDeriver<>) => TimeCalcRequests,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      substores: {|
        ada: {|
          delegation: {|
            getDelegationRequests: (PublicDeriver<>) => void | AdaDelegationRequests,
          |},
        |},
      |},
      transactions: {|
        balance: ?MultiToken,
        hasAnyPending: boolean,
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      uiNotifications: {|
        getTooltipActiveNotification: string => ?Notification,
        isOpen: string => boolean,
      |},
      wallets: {|
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        selected: null | PublicDeriver<>,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;

    const selected = stores.wallets.selected;
    if (selected == null) {
      throw new Error(`${nameof(EpochProgressContainer)} no wallet selected`);
    }
    const api = getApiForNetwork(selected.getParent().getNetworkInfo());
    const time = (() => {
      if (api === ApiOptions.ada) {
        return {
          getTimeCalcRequests: stores.substores.ada.time.getTimeCalcRequests,
          getCurrentTimeRequests: stores.substores.ada.time.getCurrentTimeRequests,
        };
      }

      return {
        getTimeCalcRequests: (undefined: any),
        getCurrentTimeRequests: () => { throw new Error(`${nameof(StakingDashboardPage)} api not supported`) },
      };
    })();
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          shouldHideBalance: stores.profile.shouldHideBalance,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
          sendMoneyRequest: {
            error: stores.wallets.sendMoneyRequest.error,
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
          },
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        uiNotifications: {
          isOpen: stores.uiNotifications.isOpen,
          getTooltipActiveNotification: stores.uiNotifications.getTooltipActiveNotification,
        },
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
          balance: stores.transactions.balance,
        },
        delegation: {
          selectedPage: stores.delegation.selectedPage,
          getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
        time,
        substores: {
          ada: {
            delegation: {
              getDelegationRequests: stores.substores.ada.delegation.getDelegationRequests,
            },
          },
        },
      },
      actions: {
        dialogs: {
          closeActiveDialog: {
            trigger: actions.dialogs.closeActiveDialog.trigger,
          },
          open: {
            trigger: actions.dialogs.open.trigger,
          },
        },
        notifications: {
          open: {
            trigger: actions.notifications.open.trigger,
          },
        },
        delegation: {
          setSelectedPage: {
            trigger: actions.delegation.setSelectedPage.trigger,
          },
        },
        ada: {
          delegationTransaction: {
            reset: {
              trigger: actions.ada.delegationTransaction.reset.trigger,
            },
            createWithdrawalTxForWallet: {
              trigger: actions.ada.delegationTransaction.createWithdrawalTxForWallet.trigger,
            },
          },
        },
      },
      UnmangleTxDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<UnmangleTxDialogContainerData>),
      WithdrawalTxDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<WithdrawalTxDialogContainerData>),
      DeregisterDialogContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<DeregisterDialogContainerData>),
    });
  }
}
