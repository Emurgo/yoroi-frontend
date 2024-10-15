// @flow
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import { observer } from 'mobx-react';

import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import StakingDashboard from '../../../components/wallet/staking/dashboard/StakingDashboard';
import UserSummary from '../../../components/wallet/staking/dashboard/UserSummary';
import StakePool from '../../../components/wallet/staking/dashboard/StakePool';
import LessThanExpectedDialog from '../../../components/wallet/staking/dashboard/LessThanExpectedDialog';
import { digestForHash } from '../../../api/ada/lib/storage/database/primitives/api/utils';
import { handleExternalLinkClick } from '../../../utils/routing';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import config from '../../../config';
import globalMessages from '../../../i18n/global-messages';
import { observable, runInAction } from 'mobx';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { genLookupOrFail, getTokenName } from '../../../stores/stateless/tokenHelpers';
import { truncateToken } from '../../../utils/formatters';
import { generateGraphData } from '../../../utils/graph';
import { maybe, noop } from '../../../coreUtils';
import type { WalletState } from '../../../../chrome/extension/background/types';

@observer
export default class StakingDashboardPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable notificationElementId: string = '';

  componentWillUnmount() {
    this.props.stores.substores.ada.delegationTransaction.reset({ justTransaction: false });
  }

  render(): Node {
    const { stores } = this.props;
    const publicDeriver = stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingDashboardPage)} no public deriver. Should never happen`);
    }
    const delegationStore = stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver.publicDeriverId);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingDashboardPage)} opened for non-reward wallet`);
    }

    const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));
    const stakePools = errorIfPresent ?? this.getStakePools(
      publicDeriver.publicDeriverId,
      publicDeriver.networkId
    );

    const showRewardAmount = errorIfPresent == null
      && stores.delegation.isExecutedDelegatedBalance(publicDeriver.publicDeriverId);

    const dashboard = (
      <StakingDashboard
        pageInfo={
          stakePools.pools == null
            ? undefined
            : {
                currentPage: stores.delegation.selectedPage,
                numPages: stakePools.pools.length,
                goToPage: page => stores.delegation.setSelectedPage(page),
              }
        }
        hasAnyPending={stores.transactions.hasAnyPending}
        stakePools={stakePools}
        userSummary={this._generateUserSummary({
          wallet: publicDeriver,
          showRewardAmount,
        })}
        graphData={generateGraphData({
          delegationRequests,
          networkId: publicDeriver.networkId,
          defaultTokenId: publicDeriver.defaultTokenId,
          currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(
            publicDeriver
          ).currentEpoch,
          shouldHideBalance: stores.profile.shouldHideBalance,
          getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
          tokenInfo: stores.tokenInfoStore.tokenInfo,
        })}
        isUnregistered={!stores.delegation.isStakeRegistered(publicDeriver.publicDeriverId)}
        epochLength={this.getEpochLengthInDays(publicDeriver)}
        ticker={truncateToken(
          getTokenName(
            stores.tokenInfoStore.getDefaultTokenInfo(publicDeriver.networkId)
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

  getEpochLengthInDays: ({ publicDeriverId: number, ... }) => ?number = (wallet) => {
    const timeCalcRequests = this.props.stores.substores.ada.time.getTimeCalcRequests(wallet);
    const { currentEpochLength, currentSlotLength } = timeCalcRequests.requests;
    const epochLengthInSeconds = currentEpochLength() * currentSlotLength();
    return epochLengthInSeconds / (60 * 60 * 24);
  };

  getStakePools: (number, number) => {| pools: null | Array<Node | void> |} = (publicDeriverId, networkId) => {
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriverId);
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
          networkId,
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

        // <TODO:PENDING_REMOVAL> LEGACY UI
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
                networkId
              ) ??
              (() => {
                throw new Error('No explorer for wallet network');
              })()
            }
            hash={pool[0]}
            moreInfo={moreInfo}
            onCopyAddressTooltip={(address, elementId) => {
              if (!uiNotifications.isOpen(elementId)) {
                runInAction(() => {
                  this.notificationElementId = elementId;
                });
                uiNotifications.open({
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

  getDialog: (WalletState) => Node = wallet => {
    const { actions, stores } = this.props;
    const uiDialogs = this.props.stores.uiDialogs;

    if (uiDialogs.isOpen(LessThanExpectedDialog)) {
      return (
        <LessThanExpectedDialog
          close={() => this.props.stores.uiDialogs.closeActiveDialog()}
        />
      );
    }

    if (uiDialogs.isOpen(UnmangleTxDialogContainer)) {
      return (
        <UnmangleTxDialogContainer
          actions={actions}
          stores={stores}
          onClose={() => this.props.stores.uiDialogs.closeActiveDialog()}
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
            noop(stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet }));
            this.props.stores.uiDialogs.open({ dialog: WithdrawalTxDialogContainer });
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
            stores.substores.ada.delegationTransaction.reset({ justTransaction: false });
            this.props.stores.uiDialogs.closeActiveDialog();
          }}
        />
      );
    }

    return null;
  };

  _generateUserSummary: ({|
    wallet: {
      publicDeriverId: number,
      networkId: number,
      defaultTokenId: string,
      ...
    },
    showRewardAmount: boolean,
  |}) => Node = request => {

    const { wallet, showRewardAmount } = request;
    const { publicDeriverId, networkId, defaultTokenId } = wallet;
    const { stores } = this.props;

    const balance = this.props.stores.transactions.balance;
    const mangledAmounts = stores.delegation.getMangledAmountsOrZero(
      publicDeriverId,
      networkId,
      defaultTokenId
    );
    const rewardBalance = this.props.stores.delegation.getRewardBalanceOrZero(
      wallet
    );

    const stakeRegistered =
      this.props.stores.delegation.isStakeRegistered(publicDeriverId) === true;

    const currentlyDelegating =
      this.props.stores.delegation.getDelegatedPoolId(publicDeriverId) != null;

    return (
      <UserSummary
        canUnmangleSum={mangledAmounts.canUnmangle}
        cannotUnmangleSum={mangledAmounts.cannotUnmangle}
        defaultTokenInfo={this.props.stores.tokenInfoStore.getDefaultTokenInfo(
          networkId
        )}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        onUnmangle={() =>
          this.props.stores.uiDialogs.open({
            dialog: UnmangleTxDialogContainer,
          })
        }
        totalSum={balance == null ? undefined : balance.joinAddCopy(rewardBalance)}
        totalRewards={showRewardAmount ? rewardBalance : undefined}
        openLearnMore={() =>
          this.props.stores.uiDialogs.open({
            dialog: LessThanExpectedDialog,
          })
        }
        withdrawRewards={
          stakeRegistered ? () => {
            this.props.stores.uiDialogs.open({ dialog: DeregisterDialogContainer });
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
