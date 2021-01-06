// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import moment from 'moment';
import { observer } from 'mobx-react';

import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphData } from '../../../components/wallet/staking/dashboard/StakingDashboard';
import type { GraphItems } from '../../../components/wallet/staking/dashboard/GraphWrapper';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import UndelegateDialog from '../../../components/wallet/staking/dashboard/UndelegateDialog';
import Dialog from '../../../components/widgets/Dialog';
import { getJormungandrTxFee } from '../../../api/jormungandr/lib/transactions/JormungandrTxSignRequest';
import DialogCloseButton from '../../../components/widgets/DialogCloseButton';
import ErrorBlock from '../../../components/widgets/ErrorBlock';
import InvalidURIImg from '../../../assets/images/uri/invalid-uri.inline.svg';
import UpcomingRewards from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import type { BoxInfo } from '../../../components/wallet/staking/dashboard/UpcomingRewards';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import PoolWarningDialog from '../../../components/wallet/staking/dashboard/PoolWarningDialog';
import { digestForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import LocalizableError from '../../../i18n/LocalizableError';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import type { GeneratedData as UnmangleTxDialogContainerData } from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import type { PoolTuples, ReputationObject } from '../../../api/jormungandr/lib/state-fetch/types';
import type { PoolMeta, DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import type { AdaDelegationRequests } from '../../../stores/ada/AdaDelegationStore';
import EpochProgressContainer from './EpochProgressContainer';
import type { GeneratedData as EpochProgressContainerData } from './EpochProgressContainer';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { PoolRequest } from '../../../api/jormungandr/lib/storage/bridge/delegationUtils';
import { SelectedExplorer } from '../../../domain/SelectedExplorer';
import type {
  ToRealTimeFunc,
  ToAbsoluteSlotNumberFunc,
  CurrentEpochLengthFunc,
  TimeSinceGenesisFunc,
} from '../../../api/common/lib/storage/bridge/timeUtils';
import type { UnitOfAccountSettingType } from '../../../types/unitOfAccountType';
import type { CreateDelegationTxFunc } from '../../../api/jormungandr/index';
import type {
  CurrentTimeRequests,
  TimeCalcRequests,
} from '../../../stores/base/BaseCardanoTimeStore';
import type { TxRequests } from '../../../stores/toplevel/TransactionsStore';
import type { Notification } from '../../../types/notificationType';

import globalMessages from '../../../i18n/global-messages';
import { computed, observable, runInAction } from 'mobx';
import { ApiOptions, getApiForNetwork, } from '../../../api/common/utils';
import type { NetworkRow, TokenRow, } from '../../../api/ada/lib/storage/database/primitives/tables';
import {
  isJormungandr,
  isCardanoHaskell,
  getCardanoHaskellBaseConfig,
} from '../../../api/ada/lib/storage/database/prepackaged/networks';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import type { GeneratedData as DeregisterDialogContainerData } from '../../transfer/DeregisterDialogContainer';
import type { GeneratedData as WithdrawalTxDialogContainerData } from '../../transfer/WithdrawalTxDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import {
  MultiToken,
} from '../../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../../stores/toplevel/TokenInfoStore';
import { getTokenName, genLookupOrFail } from '../../../stores/stateless/tokenHelpers';

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
    this.generated.actions.jormungandr.delegationTransaction.reset.trigger();
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

    const { getThemeVars } = this.generated.stores.profile;

    const dashboard = (
      <StakingDashboard
        pageInfo={
          !delegationRequests.getCurrentDelegation.wasExecuted ||
          delegationRequests.getCurrentDelegation.isExecuting
            ? undefined
            : {
                currentPage: this.generated.stores.delegation.selectedPage,
                numPages: Array.from(
                  new Set(
                    delegationRequests.getCurrentDelegation.result?.currEpoch?.pools.map(
                      tuple => tuple[0]
                    )
                  ) ?? []
                ).length,
                goToPage: page => this.generated.actions.delegation.setSelectedPage.trigger(page),
              }
        }
        hasAnyPending={this.generated.stores.transactions.hasAnyPending}
        themeVars={getThemeVars({ theme: 'YoroiModern' })}
        stakePools={stakePools}
        epochProgress={
          <EpochProgressContainer
            {...this.generated.EpochProgressContainerProps}
            publicDeriver={publicDeriver}
            showTooltip={rewardInfo != null && rewardInfo.showWarning}
          />
        }
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
        ticker={getTokenName(
          this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
            publicDeriver.getParent().getNetworkInfo().NetworkId
          )
        )}
      />
    );

    const popup = this.generatePopupDialog(publicDeriver);
    return (
      <>
        {popup}
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

  generatePopupDialog: (PublicDeriver<>) => null | Node = publicDeriver => {
    if (!isJormungandr(publicDeriver.getParent().getNetworkInfo())) {
      return null; // TODO
    }

    const { uiDialogs } = this.generated.stores;
    const delegationTxStore = this.generated.stores.substores.jormungandr.delegationTransaction;

    const cancel = () => {
      this.generated.actions.dialogs.closeActiveDialog.trigger();
      this.generated.actions.jormungandr.delegationTransaction.reset.trigger();
    };
    if (delegationTxStore.createDelegationTx.error != null) {
      const { intl } = this.context;

      return (
        <Dialog
          title={intl.formatMessage(globalMessages.errorLabel)}
          closeOnOverlayClick={false}
          onClose={cancel}
          closeButton={<DialogCloseButton onClose={cancel} />}
          actions={[
            {
              label: intl.formatMessage(globalMessages.backButtonLabel),
              onClick: cancel,
              primary: true,
            },
          ]}
        >
          <>
            <center>
              <InvalidURIImg />
            </center>
            <ErrorBlock error={delegationTxStore.createDelegationTx.error} />
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

    return (
      <UndelegateDialog
        onCancel={cancel}
        classicTheme={this.generated.stores.profile.isClassicTheme}
        error={this.generated.stores.wallets.sendMoneyRequest.error}
        onSubmit={async request => {
          await this.generated.actions.jormungandr.delegationTransaction.signTransaction.trigger({
            password: request.password,
            publicDeriver,
          });
          cancel();
        }}
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        generatingTx={
          this.generated.stores.substores.jormungandr.delegationTransaction.createDelegationTx
            .isExecuting
        }
        isSubmitting={this.generated.stores.wallets.sendMoneyRequest.isExecuting}
        transactionFee={getJormungandrTxFee(
          delegationTx.signTxRequest.self(),
          publicDeriver.getParent().getNetworkInfo().NetworkId,
        )}
        staleTx={delegationTxStore.isStale}
      />
    );
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
              useEndOfEpoch={!isJormungandr(publicDeriver.getParent().getNetworkInfo())}
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
              pools: currEpochCert.pools,
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
              pools: result.prevEpoch.pools,
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
              pools: result.prevPrevEpoch.pools,
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
              pools: result.prevPrevPrevEpoch.pools,
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
            useEndOfEpoch={!isJormungandr(publicDeriver.getParent().getNetworkInfo())}
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
            useEndOfEpoch={!isJormungandr(publicDeriver.getParent().getNetworkInfo())}
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
        // in Jormungandr, rewards were distributed at the start of the epoch
        // in Haskell, rewards are calculated at the start of the epoch but distributed at the end
        slot: isJormungandr(request.publicDeriver.getParent().getNetworkInfo())
          ? 0
          : request.getEpochLength(),
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
    if (delegationRequests.getCurrentDelegation.result != null) {
      const currentDelegation = delegationRequests.getCurrentDelegation.result;
      const currEpochInfo = currentDelegation.currEpoch;
      if (currEpochInfo == null) {
        return undefined;
      }
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
      !delegationRequests.getCurrentDelegation.wasExecuted ||
      delegationRequests.getCurrentDelegation.isExecuting ||
      delegationRequests.getCurrentDelegation.result == null
    ) {
      return { pools: null };
    }
    if (delegationRequests.getCurrentDelegation.result.currEpoch == null) {
      return { pools: [] };
    }
    const currentPools = delegationRequests.getCurrentDelegation.result.currEpoch.pools;

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
            undelegate={
              // don't support undelegation for ratio stake since it's a less intuitive UX
              currentPools.length === 1 && isJormungandr(publicDeriver.getParent().getNetworkInfo())
                ? async () => {
                    this.generated.actions.dialogs.open.trigger({ dialog: UndelegateDialog });
                    await this.generated.actions.jormungandr.delegationTransaction.
                    createTransaction.trigger(
                      {
                        publicDeriver,
                        poolRequest: undefined,
                      }
                    );
                  }
                : undefined
            }
            reputationInfo={meta.reputation}
            openReputationDialog={() =>
              this.generated.actions.dialogs.open.trigger({
                dialog: PoolWarningDialog,
                params: { reputation: meta.reputation },
              })
            }
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

    if (uiDialogs.isOpen(PoolWarningDialog)) {
      return (
        <PoolWarningDialog
          close={() => this.generated.actions.dialogs.closeActiveDialog.trigger()}
          reputationInfo={uiDialogs.getParam<ReputationObject>('reputation')}
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
      request.delegationRequests.getCurrentDelegation.wasExecuted &&
      request.delegationRequests.getDelegatedBalance.wasExecuted &&
      request.errorIfPresent == null;

    const unmangledAmountsRequest = request.delegationRequests.mangledAmounts.result;

    const defaultToken = request.publicDeriver.getParent().getDefaultToken();

    const txRequests = this.generated.stores.transactions.getTxRequests(request.publicDeriver);
    const balance = txRequests.requests.getBalanceRequest.result;
    const rewardBalance =
      request.delegationRequests.getDelegatedBalance.result == null
        ? new MultiToken([], defaultToken)
        : request.delegationRequests.getDelegatedBalance.result.accountPart;

    const currentlyDelegating =
      (request.delegationRequests.getCurrentDelegation.result?.currEpoch?.pools ?? []).length > 0;

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
        unitOfAccount={entry => {
          const tokenRow = this.generated.stores.tokenInfoStore.tokenInfo
            .get(entry.networkId.toString())
            ?.get(entry.identifier);
          if (tokenRow == null) return undefined;

          if (!this.generated.stores.profile.unitOfAccount.enabled) return undefined;
          const currency = this.generated.stores.profile.unitOfAccount.currency;

          const shiftedAmount = entry.amount
            .shiftedBy(-tokenRow.Metadata.numberOfDecimals);

          const coinPrice = this.generated.stores.coinPriceStore.getCurrentPrice(
            tokenRow.Identifier,
            currency
          );
          if (coinPrice == null) return undefined;
          return {
            currency,
            amount: calculateAndFormatValue(shiftedAmount, coinPrice),
          };
        }}
        shouldHideBalance={this.generated.stores.profile.shouldHideBalance}
        totalDelegated={(() => {
            if (!showRewardAmount) return undefined;
            if (request.delegationRequests.getDelegatedBalance.result == null) return undefined;

            return currentlyDelegating
              ? request.delegationRequests.getDelegatedBalance.result.utxoPart
                  .joinAddCopy(
                    request.delegationRequests.getDelegatedBalance.result.accountPart
                  )
              : new MultiToken([], defaultToken)
          })()
        }
      />
    );
  };

  _isRegistered: (PublicDeriver<>) => ?boolean = publicDeriver => {
    if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
      return undefined;
    }
    const adaDelegationRequests = this.generated.stores.substores.ada.
      delegation.getDelegationRequests(
      publicDeriver
    );
    if (adaDelegationRequests == null) return undefined;
    return adaDelegationRequests.getRegistrationHistory.result?.current;
  };

  _generateRewardGraphData: ({|
    delegationRequests: DelegationRequests,
    currentEpoch: number,
    publicDeriver: PublicDeriver<>,
  |}) => ?{|
    totalRewards: Array<GraphItems>,
    perEpochRewards: Array<GraphItems>,
  |} = request => {
    const defaultToken = request.publicDeriver.getParent().getDefaultToken();

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
    let amountSum = new MultiToken([], defaultToken);

    const startEpoch = (() => {
      if (isCardanoHaskell(request.publicDeriver.getParent().getNetworkInfo())) {
        const shelleyConfig = getCardanoHaskellBaseConfig(
          request.publicDeriver.getParent().getNetworkInfo()
        )[1];
        return shelleyConfig.StartAt;
      }
      return 0;
    })();
    const endEpoch = (() => {
      if (isCardanoHaskell(request.publicDeriver.getParent().getNetworkInfo())) {
        // TODO: -1 since cardano-db-sync doesn't expose this information for some reason
        return request.currentEpoch - 1;
      }
      if (isJormungandr(request.publicDeriver.getParent().getNetworkInfo())) {
        // note: reward history includes the current epoch
        // since it tells you the reward you got at slot 0 of the new epoch
        return request.currentEpoch + 1;
      }
      throw new Error(
        `${nameof(this._generateRewardGraphData)} can't compute endEpoch for rewards`
      );
    })();

    const getNormalized = (tokenEntry) => {
      const tokenRow = this.generated.stores.tokenInfoStore.tokenInfo
        .get(tokenEntry.networkId.toString())
        ?.get(tokenEntry.identifier);
      if (tokenRow == null) throw new Error(`${nameof(StakingDashboardPage)} no token info for ${JSON.stringify(tokenEntry)}`);

      return tokenEntry.amount.shiftedBy(-tokenRow.Metadata.numberOfDecimals);
    }
    for (let i = startEpoch; i < endEpoch; i++) {
      if (historyIterator < history.length && i === history[historyIterator][0]) {
        // exists a reward for this epoch
        const nextReward = history[historyIterator][1];
        amountSum = amountSum.joinAddMutable(nextReward);
        totalRewards.push({
          name: i,
          primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
        });
        perEpochRewards.push({
          name: i,
          primary: getNormalized(nextReward.getDefaultEntry()).toNumber(),
        });
        historyIterator++;
      } else {
        // no reward for this epoch
        totalRewards.push({
          name: i,
          primary: getNormalized(amountSum.getDefaultEntry()).toNumber(),
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
  };

  _generateGraphData: ({|
    delegationRequests: DelegationRequests,
    publicDeriver: PublicDeriver<>,
  |}) => GraphData = request => {
    const timeStore = this.generated.stores.time;
    const currTimeRequests = timeStore.getCurrentTimeRequests(request.publicDeriver);

    return {
      rewardsGraphData: {
        error: request.delegationRequests.rewardHistory.error,
        items: this._generateRewardGraphData({
          delegationRequests: request.delegationRequests,
          currentEpoch: currTimeRequests.currentEpoch,
          publicDeriver: request.publicDeriver,
        }),
        hideYAxis: this.generated.stores.profile.shouldHideBalance,
      },
    };
  };

  @computed get generated(): {|
    EpochProgressContainerProps: InjectedOrGenerated<EpochProgressContainerData>,
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
      jormungandr: {|
        delegationTransaction: {|
          createTransaction: {|
            trigger: (params: {|
              poolRequest: PoolRequest,
              publicDeriver: PublicDeriver<>,
            |}) => Promise<void>,
          |},
          reset: {| trigger: (params: void) => void |},
          signTransaction: {|
            trigger: (params: {|
              password?: string,
              publicDeriver: PublicDeriver<>,
            |}) => Promise<void>,
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
        getCurrentPrice: (from: string, to: string) => ?number,
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      profile: {|
        getThemeVars: ({| theme: string |}) => {
          [key: string]: string,
          ...
        },
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
        jormungandr: {|
          delegationTransaction: {|
            createDelegationTx: {|
              error: ?LocalizableError,
              isExecuting: boolean,
              result: ?PromisslessReturnType<CreateDelegationTxFunc>,
            |},
            isStale: boolean,
          |},
        |},
      |},
      transactions: {|
        getTxRequests: (PublicDeriver<>) => TxRequests,
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
    const jormungandrStore = stores.substores.jormungandr;

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
      if (api === ApiOptions.jormungandr) {
        return {
          getTimeCalcRequests: stores.substores.jormungandr.time.getTimeCalcRequests,
          getCurrentTimeRequests: stores.substores.jormungandr.time.getCurrentTimeRequests,
        };
      }
      throw new Error(`${nameof(EpochProgressContainer)} api not supported`);
    })();
    return Object.freeze({
      stores: {
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          shouldHideBalance: stores.profile.shouldHideBalance,
          getThemeVars: stores.profile.getThemeVars,
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
          getTxRequests: stores.transactions.getTxRequests,
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
          jormungandr: {
            delegationTransaction: {
              isStale: jormungandrStore.delegationTransaction.isStale,
              createDelegationTx: {
                isExecuting: jormungandrStore.delegationTransaction.createDelegationTx.isExecuting,
                error: jormungandrStore.delegationTransaction.createDelegationTx.error,
                result: jormungandrStore.delegationTransaction.createDelegationTx.result,
              },
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
        jormungandr: {
          delegationTransaction: {
            reset: {
              trigger: actions.jormungandr.delegationTransaction.reset.trigger,
            },
            signTransaction: {
              trigger: actions.jormungandr.delegationTransaction.signTransaction.trigger,
            },
            createTransaction: {
              trigger: actions.jormungandr.delegationTransaction.createTransaction.trigger,
            },
          },
        },
      },
      EpochProgressContainerProps: ({
        stores,
        actions,
      }: InjectedOrGenerated<EpochProgressContainerData>),
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
