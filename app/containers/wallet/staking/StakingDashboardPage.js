// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import { getOrDefault } from '../../../domain/Explorer';
import type { InjectedProps } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphData } from '../../../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphItems, } from '../../../components/wallet/staking/dashboard/GraphWrapper';
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
import PoolWarningDialog from '../../../components/wallet/staking/dashboard/PoolWarningDialog';
import environment from '../../../environment';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';
import { digetForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import { GetPoolInfoApiError } from '../../../api/ada/errors';
import LocalizableError from '../../../i18n/LocalizableError';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import { formattedWalletAmount } from '../../../utils/formatters';
import type { PoolTuples, ReputationObject, } from '../../../api/ada/lib/state-fetch/types';
import type { DelegationRequests } from '../../../stores/ada/DelegationStore';
import EpochProgressContainer from './EpochProgressContainer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';

import type {
  ToRealTimeFunc,
  ToAbsoluteSlotNumberFunc,
} from '../../../api/ada/lib/storage/bridge/timeUtils';

import globalMessages from '../../../i18n/global-messages';
import { runInAction } from 'mobx';

type Props = {|
  ...InjectedProps,
|};

type State = {|
  +notificationElementId: string,
|};

@observer
export default class StakingDashboardPage extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    this.setState({
      notificationElementId: '',
    });

    const timeStore = this.props.stores.substores.ada.time;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    await timeCalcRequests.toAbsoluteSlot.execute().promise;
    await timeCalcRequests.toRealTime.execute().promise;
    await timeCalcRequests.currentEpochLength.execute().promise;
    await timeCalcRequests.currentSlotLength.execute().promise;
  }

  componentWillUnmount() {
    this.props.actions[environment.API].delegationTransaction.reset.trigger();
  }

  hideOrFormat: BigNumber => string = (amount) => {
    return this.props.stores.profile.shouldHideBalance
      ? '******'
      : formattedWalletAmount(amount);
  };

  render() {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }

    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const rewardInfo = this.getRewardInfo(publicDeriver);

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
        epochProgress={<EpochProgressContainer
          actions={this.props.actions}
          stores={this.props.stores}
          publicDeriver={publicDeriver}
          showTooltip={rewardInfo != null && rewardInfo.showWarning}
        />}
        userSummary={this._generateUserSummary({
          delegationRequests,
          publicDeriver,
          errorIfPresent,
        })}
        upcomingRewards={rewardInfo?.rewardPopup}
        graphData={this._generateGraphData({
          delegationRequests,
          publicDeriver,
        })}
        delegationHistory={delegationRequests.getCurrentDelegation.result?.fullHistory}
        epochLength={this.getEpochLengthInDays(publicDeriver)}
      />
    );

    const popup = this.generatePopupDialog(publicDeriver);
    return (
      <>
        {popup}
        {this.getDialog()}
        {dashboard}
      </>);
  }

  getEpochLengthInDays: PublicDeriver<> => ?number = (publicDeriver) => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    const getEpochLength = timeCalcRequests.currentEpochLength.result;
    if (getEpochLength == null) return null;

    const getSlotLength = timeCalcRequests.currentSlotLength.result;
    if (getSlotLength == null) return null;

    const epochLengthInSeconds = getEpochLength() * getSlotLength();
    const epochLengthInDays = epochLengthInSeconds / (60 * 60 * 24);
    return epochLengthInDays;
  }

  generatePopupDialog: PublicDeriver<> => (null | Node) = (publicDeriver) => {
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
          .trigger({ password: request.password, publicDeriver, });
        cancel();
      }}
      isSubmitting={delegationTxStore.signAndBroadcastDelegationTx.isExecuting}
      transactionFee={getShelleyTxFee(delegationTx.unsignedTx.IOs, true)}
      staleTx={delegationTxStore.isStale}
    />);
  }

  getRewardInfo: PublicDeriver<> => (void | {|
    rewardPopup: Node,
    showWarning: boolean,
  |}) = (publicDeriver) => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    const currTimeRequests = timeStore.getCurrentTimeRequests(publicDeriver);
    const toAbsoluteSlot = timeCalcRequests.toAbsoluteSlot.result;
    if (toAbsoluteSlot == null) return undefined;
    const toRealTime = timeCalcRequests.toRealTime.result;
    if (toRealTime == null) return undefined;

    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
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
                  epoch: currTimeRequests.currentEpoch + 1,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch + 2,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
                }),
                this.generateUpcomingRewardInfo({
                  epoch: currTimeRequests.currentEpoch + 3,
                  pools: [],
                  toAbsoluteSlot,
                  toRealTime,
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
            epoch: currTimeRequests.currentEpoch + i + 1,
            pools: currEpochCert.pools,
            toAbsoluteSlot,
            toRealTime,
          }));
        }
        if (result.prevEpoch) {
          upcomingRewards.unshift(this.generateUpcomingRewardInfo({
            epoch: currTimeRequests.currentEpoch + 2,
            pools: result.prevEpoch.pools,
            toAbsoluteSlot,
            toRealTime,
          }));
        }
        if (result.prevPrevEpoch) {
          upcomingRewards.unshift(this.generateUpcomingRewardInfo({
            epoch: currTimeRequests.currentEpoch + 1,
            pools: result.prevPrevEpoch.pools,
            toAbsoluteSlot,
            toRealTime,
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

    return rewardInfo ?? ({
      rewardPopup: (
        <UpcomingRewards
          content={[null, null, null]}
          showWarning={false}
          onExternalLinkClick={handleExternalLinkClick}
          baseUrl=""
        />
      ),
      showWarning: false,
    });
  }

  generateUpcomingRewardInfo: {|
    epoch: number,
    pools: Array<PoolTuples>,
    toRealTime: ToRealTimeFunc,
    toAbsoluteSlot: ToAbsoluteSlotNumberFunc,
  |} => BoxInfo = (request) => {

    const endEpochTime = request.toRealTime({
      absoluteSlotNum: request.toAbsoluteSlot({
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

  getErrorInFetch: PublicDeriver<> => void | {| error: LocalizableError, |} = (
    publicDeriver
  ) => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
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

  getStakePools: PublicDeriver<> => {| pools: null | Array<Node> |} = (
    publicDeriver
  ) => {
    const delegationStore = this.props.stores.substores[environment.API].delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
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

    const poolReputation = delegationStore.poolReputation.result ?? {};

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
            notification={this.state == null
              ? null
              : uiNotifications.getTooltipActiveNotification(
                this.state.notificationElementId
              )
            }
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
            reputationInfo={poolReputation[pool[0]] ?? {}}
            openReputationDialog={() => this.props.actions.dialogs.open.trigger({
              dialog: PoolWarningDialog,
              params: { reputation: (poolReputation[pool[0]] ?? {}) },
            })}
          />
        );
      })
    };
  }

  getDialog: void => Node = () => {
    const uiDialogs = this.props.stores.uiDialogs;

    if (uiDialogs.isOpen(LessThanExpectedDialog)) {
      return (
        <LessThanExpectedDialog
          close={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
          classicTheme={this.props.stores.profile.isClassicTheme}
        />
      );
    }

    if (uiDialogs.isOpen(PoolWarningDialog)) {
      return (
        <PoolWarningDialog
          close={() => this.props.actions.dialogs.closeActiveDialog.trigger()}
          classicTheme={this.props.stores.profile.isClassicTheme}
          reputationInfo={uiDialogs.getParam<ReputationObject>('reputation')}
        />
      );
    }

    if (uiDialogs.isOpen(UnmangleTxDialogContainer)) {
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
    publicDeriver: PublicDeriver<>,
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

    const txRequests = this.props.stores.substores.ada.transactions
      .getTxRequests(request.publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result;
    return (
      <UserSummary
        canUnmangleSum={canUnmangleSum}
        cannotUnmangleSum={cannotUnmangleSum}
        onUnmangle={() => this.props.actions.dialogs.open.trigger({
          dialog: UnmangleTxDialogContainer,
        })}
        totalAdaSum={balance == null
          ? undefined
          : this.hideOrFormat(balance.dividedBy(
            LOVELACES_PER_ADA
          ))
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

  _generateRewardGraphData: {|
    delegationRequests: DelegationRequests,
    currentEpoch: number,
  |} => (?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |}) = (
    request
  ) => {
    const history = request.delegationRequests.rewardHistory.result;
    if (history == null) {
      return null;
    }
    if (!request.delegationRequests.getCurrentDelegation.wasExecuted) {
      return null;
    }
    let historyIterator = 0;

    // the reward history endpoint doesn't contain entries when the reward was 0
    // so we need to insert these manually
    const totalRewards: Array<GraphItems> = [];
    const perEpochRewards: Array<GraphItems> = [];
    let adaSum = new BigNumber(0);
    // note: reward history includes the current epoch
    // since it tells you the reward you got at slot 0 of the new epoch
    for (let i = 0; i <= request.currentEpoch; i++) {
      if (historyIterator < history.length && i === history[historyIterator][0]) {
        // exists a reward for this epoch
        const nextReward = history[historyIterator][1];
        adaSum = adaSum.plus(nextReward);
        totalRewards.push({
          name: i,
          primary: adaSum.dividedBy(LOVELACES_PER_ADA).toNumber(),
        });
        perEpochRewards.push({
          name: i,
          primary: nextReward / LOVELACES_PER_ADA.toNumber(),
        });
        historyIterator++;
      } else {
        // no reward for this epoch
        totalRewards.push({
          name: i,
          primary: adaSum.dividedBy(LOVELACES_PER_ADA).toNumber(),
        });
        perEpochRewards.push({
          name: i,
          primary: 0,
        });
      }
    }
    return {
      totalRewards,
      perEpochRewards,
    };
  }

  _generateGraphData: {|
    delegationRequests: DelegationRequests,
    publicDeriver: PublicDeriver<>,
  |} => GraphData = (request) => {
    const timeStore = this.props.stores.substores.ada.time;
    const currTimeRequests = timeStore.getCurrentTimeRequests(request.publicDeriver);

    return {
      rewardsGraphData: {
        error: request.delegationRequests.rewardHistory.error,
        items: this._generateRewardGraphData({
          delegationRequests: request.delegationRequests,
          currentEpoch: currTimeRequests.currentEpoch,
        }),
        hideYAxis: this.props.stores.profile.shouldHideBalance
      }
    };
  }
}
