// @flow
import { observer } from 'mobx-react';
import moment from 'moment';
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { intlShape } from 'react-intl';
import type { ConfigType } from '../../../../config/config-types';
import { withLayout } from '../../../styles/context/layout';
import type { TokenEntry } from '../../../api/common/lib/MultiToken';

import { Box, styled } from '@mui/system';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import DelegatedStakePoolCard from '../../../components/wallet/staking/dashboard-revamp/DelegatedStakePoolCard';
import EpochProgressWrapper from '../../../components/wallet/staking/dashboard-revamp/EpochProgressWrapper';
import OverviewModal from '../../../components/wallet/staking/dashboard-revamp/OverviewDialog';
import RewardHistoryDialog from '../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';
import SummaryCard from '../../../components/wallet/staking/dashboard-revamp/SummaryCard';
import { compose, maybe, noop } from '../../../coreUtils';
import globalMessages from '../../../i18n/global-messages';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import { formatLovelacesHumanReadableShort, roundOneDecimal, roundTwoDecimal } from '../../../utils/formatters';
import { generateGraphData } from '../../../utils/graph';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import WalletEmptyBanner from '../WalletEmptyBanner';
import { GovernanceParticipateDialog } from '../dialogs/GovernanceParticipateDialog';
import CardanoStakingPage from './CardanoStakingPage';
import WithdrawRewardsDialog from './WithdrawRewardsDialog';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...StoresAndActionsProps, ...InjectedLayoutProps |};
@observer
class StakingPageContent extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  async componentDidMount() {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    if (this.props.stores.delegation.getPoolTransitionConfig(publicDeriver).shouldUpdatePool) {
      const poolTransitionInfo = this.props.stores.delegation.getPoolTransitionInfo(publicDeriver);
      if (poolTransitionInfo?.suggestedPool) {
        this.props.stores.delegation.delegateToSpecificPool(poolTransitionInfo.suggestedPool.hash);
        noop(this.props.stores.delegation.createDelegationTransaction());
      }
    }
  }

  getEpochLengthInDays: (PublicDeriver<>) => ?number = publicDeriver => {
    const timeCalcRequests = this.props.stores.substores.ada.time.getTimeCalcRequests(publicDeriver);
    const { currentEpochLength, currentSlotLength } = timeCalcRequests.requests;
    const epochLengthInSeconds = currentEpochLength() * currentSlotLength();
    return epochLengthInSeconds / (60 * 60 * 24);
  };

  createWithdrawalTx: (shouldDeregister: boolean) => void = shouldDeregister => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    this.props.actions.ada.delegationTransaction.setShouldDeregister.trigger(shouldDeregister);
    const { delegationTransaction } = this.props.actions.ada;
    delegationTransaction.createWithdrawalTxForWallet.trigger({ publicDeriver });
    this.props.actions.dialogs.open.trigger({
      dialog: WithdrawRewardsDialog,
    });
  };

  getStakePoolMeta: (PublicDeriver<>) => Node = publicDeriver => {
    const delegationStore = this.props.stores.delegation;
    const currentPool = delegationStore.getDelegatedPoolId(publicDeriver);
    if (currentPool == null) return null;

    const networkInfo = publicDeriver.getParent().getNetworkInfo();
    const poolMeta = delegationStore.getLocalPoolInfo(networkInfo, currentPool);
    const { stake, roa, saturation, pic } = delegationStore.getLocalRemotePoolInfo(networkInfo, currentPool) ?? {};
    if (poolMeta == null) {
      // server hasn't returned information about the stake pool yet
      return null;
    }
    const { intl } = this.context;
    const name = poolMeta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);
    const delegatedPool = {
      id: String(currentPool),
      name,
      avatar: pic,
      roa: maybe(roa, compose(Number, roundTwoDecimal)),
      poolSize: maybe(stake, formatLovelacesHumanReadableShort),
      share: maybe(saturation, s => roundOneDecimal(Number(s) * 100)),
      websiteUrl: poolMeta.info?.homepage,
      ticker: poolMeta.info?.ticker,
    };

    return (
      <DelegatedStakePoolCard
        poolTransition={delegationStore.getPoolTransitionInfo(publicDeriver)}
        delegatedPool={delegatedPool}
        undelegate={async () => this.createWithdrawalTx(true)} // shouldDeregister=true
        delegateToSpecificPool={async (poolId): any => {
          this.props.stores.delegation.delegateToSpecificPool(poolId);
          this.props.stores.delegation.createDelegationTransaction();
        }}
      />
    );
  };

  getEpochProgress: (PublicDeriver<>) => Node | void = publicDeriver => {
    const timeCalcRequests = this.props.stores.substores.ada.time.getTimeCalcRequests(publicDeriver);
    const { toAbsoluteSlot, toRealTime, currentEpochLength } = timeCalcRequests.requests;

    const currTimeRequests = this.props.stores.substores.ada.time.getCurrentTimeRequests(publicDeriver);
    const currentEpoch = currTimeRequests.currentEpoch;

    const epochLength = currentEpochLength();
    const getDateFromEpoch = (epoch, returnEpochTime = false) => {
      const epochTime = toRealTime({
        absoluteSlotNum: toAbsoluteSlot({
          epoch,
          // Rewards are calculated at the start of the epoch but distributed at the end
          slot: epochLength,
        }),
      });
      return returnEpochTime ? epochTime : moment(epochTime).format('lll');
    };

    const endEpochDate = getDateFromEpoch(currentEpoch);
    const endEpochDateTime = getDateFromEpoch(currentEpoch, true);
    const previousEpochDate = getDateFromEpoch(currentEpoch - 1);

    return (
      <EpochProgressWrapper
        epochProgress={{
          startEpochDate: previousEpochDate,
          currentEpoch,
          endEpochDate,
          endEpochDateTime,
          percentage: Math.floor((100 * currTimeRequests.currentSlot) / epochLength),
        }}
      />
    );
  };

  toUnitOfAccount: TokenEntry => void | {| currency: string, amount: string |} = entry => {
    const { stores } = this.props;
    const tokenRow = stores.tokenInfoStore.tokenInfo.get(entry.networkId.toString())?.get(entry.identifier);
    if (tokenRow == null) return undefined;

    if (!stores.profile.unitOfAccount.enabled) return undefined;
    const currency = stores.profile.unitOfAccount.currency;

    const shiftedAmount = entry.amount.shiftedBy(-tokenRow.Metadata.numberOfDecimals);
    const ticker = tokenRow.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const coinPrice = stores.coinPriceStore.getCurrentPrice(ticker, currency);
    if (coinPrice == null) return { currency, amount: '-' };
    return {
      currency,
      amount: calculateAndFormatValue(shiftedAmount, coinPrice),
    };
  };

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    const { actions, stores } = this.props;
    const { uiDialogs, delegation: delegationStore } = stores;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    const balance = stores.transactions.getBalance(publicDeriver);
    const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();

    const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));

    const showRewardAmount = errorIfPresent == null && stores.delegation.isExecutedDelegatedBalance(publicDeriver);

    const isStakeRegistered = stores.delegation.isStakeRegistered(publicDeriver);
    const currentlyDelegating = stores.delegation.isCurrentlyDelegating(publicDeriver);
    const delegatedUtxo = stores.delegation.getDelegatedUtxoBalance(publicDeriver);
    const delegatedRewards = stores.delegation.getRewardBalanceOrZero(publicDeriver);
    const isParticipatingToGovernance = stores.delegation.governanceStatus;

    return (
      <Box>
        {isWalletWithNoFunds ? (
          <WalletEmptyBanner onBuySellClick={() => this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })} />
        ) : null}

        {isStakeRegistered ? (
          <WrapperCards>
            <SummaryCard
              onOverviewClick={() =>
                actions.dialogs.open.trigger({
                  dialog: OverviewModal,
                })
              }
              withdrawRewards={
                isParticipatingToGovernance === false
                  ? async () => {
                      this.props.actions.dialogs.open.trigger({
                        dialog: GovernanceParticipateDialog,
                      });
                    }
                  : isStakeRegistered
                  ? async () => this.createWithdrawalTx(false) // shouldDeregister=false
                  : undefined
              }
              unitOfAccount={this.toUnitOfAccount}
              getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
              shouldHideBalance={stores.profile.shouldHideBalance}
              totalRewards={showRewardAmount ? delegatedRewards : undefined}
              totalDelegated={(() => {
                if (!showRewardAmount) return undefined;
                return currentlyDelegating
                  ? maybe(delegatedUtxo, w => delegatedRewards.joinAddCopy(w))
                  : maybe(publicDeriver, w => w.getParent().getDefaultMultiToken());
              })()}
              graphData={generateGraphData({
                publicDeriver,
                delegationRequests,
                currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(publicDeriver).currentEpoch,
                shouldHideBalance: stores.profile.shouldHideBalance,
                getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
                tokenInfo: stores.tokenInfoStore.tokenInfo,
              })}
              onOpenRewardList={() =>
                actions.dialogs.open.trigger({
                  dialog: RewardHistoryDialog,
                })
              }
            />
            <RightCardsWrapper>
              {!errorIfPresent && this.getStakePoolMeta(publicDeriver)}
              {!errorIfPresent && this.getEpochProgress(publicDeriver)}
            </RightCardsWrapper>
          </WrapperCards>
        ) : null}

        <CardanoStakingPage
          stores={this.props.stores}
          actions={this.props.actions}
          urlTemplate={CONFIG.poolExplorer.simpleTemplate}
        />

        {uiDialogs.isOpen(OverviewModal) ? (
          <OverviewModal
            onClose={this.onClose}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
            totalRewards={showRewardAmount ? delegatedRewards : undefined}
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            unitOfAccount={this.toUnitOfAccount}
            withdrawRewards={
              isParticipatingToGovernance === false
                ? () => {
                    this.props.actions.dialogs.open.trigger({
                      dialog: GovernanceParticipateDialog,
                    });
                  }
                : isStakeRegistered
                ? () => {
                    this.props.actions.dialogs.open.trigger({
                      dialog: GovernanceParticipateDialog,
                    });
                  }
                : undefined
            }
          />
        ) : null}
        {uiDialogs.isOpen(DeregisterDialogContainer) ? (
          <DeregisterDialogContainer
            actions={actions}
            stores={stores}
            alwaysShowDeregister
            onNext={() => {
              // note: purposely don't await
              // since the next dialog will properly render the spinner
              const { delegationTransaction } = this.props.actions.ada;
              delegationTransaction.createWithdrawalTxForWallet.trigger({ publicDeriver });
              this.props.actions.dialogs.open.trigger({
                // dialog: WithdrawalTxDialogContainer,
                dialog: WithdrawRewardsDialog,
              });
            }}
          />
        ) : null}
        {uiDialogs.isOpen(GovernanceParticipateDialog) ? (
          <GovernanceParticipateDialog actions={actions} onClose={this.onClose} intl={this.context.intl} />
        ) : null}
        {uiDialogs.isOpen(UnmangleTxDialogContainer) ? (
          <UnmangleTxDialogContainer actions={actions} stores={stores} onClose={this.onClose} />
        ) : null}
        {uiDialogs.isOpen(WithdrawalTxDialogContainer) ? (
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
        ) : null}
        {uiDialogs.isOpen(WithdrawRewardsDialog) ? (
          <WithdrawRewardsDialog
            actions={actions}
            stores={stores}
            onClose={() => {
              this.props.actions.ada.delegationTransaction.reset.trigger({
                justTransaction: false,
              });
              this.props.actions.dialogs.closeActiveDialog.trigger();
            }}
          />
        ) : null}
        {uiDialogs.isOpen(RewardHistoryDialog) ? (
          <RewardHistoryDialog
            onClose={this.onClose}
            graphData={generateGraphData({
              delegationRequests,
              publicDeriver,
              currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(publicDeriver).currentEpoch,
              shouldHideBalance: stores.profile.shouldHideBalance,
              getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
              tokenInfo: stores.tokenInfoStore.tokenInfo,
            })}
          />
        ) : null}
      </Box>
    );
  }
}
export default (withLayout(StakingPageContent): ComponentType<StoresAndActionsProps>);

const WrapperCards = styled(Box)({
  display: 'flex',
  gap: '24px',
  justifyContent: 'space-between',
  marginBottom: '40px',
});

const RightCardsWrapper = styled(Box)({
  display: 'flex',
  flex: '1 1 48.5%',
  maxWidth: '48.5%',
  flexDirection: 'column',
  gap: '24px',
});
