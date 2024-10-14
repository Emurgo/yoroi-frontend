// @flow
import { observer } from 'mobx-react';
import moment from 'moment';
import type { Node } from 'react';
import { Component } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import type { ConfigType } from '../../../../config/config-types';
import type { TokenEntry } from '../../../api/common/lib/MultiToken';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { Box, styled } from '@mui/system';
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
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

@observer
export default class StakingPageContent extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  async componentDidMount() {
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }
    // Check governance only for certain network
    if (wallet.type !== 'trezor') {
      noop(this.props.stores.delegation.checkGovernanceStatus(wallet));
    }
    if (this.props.stores.delegation.getPoolTransitionConfig(wallet).shouldUpdatePool) {
      const poolTransitionInfo = this.props.stores.delegation.getPoolTransitionInfo(wallet);
      if (poolTransitionInfo?.suggestedPool) {
        noop(this.props.stores.delegation.createDelegationTransaction(poolTransitionInfo.suggestedPool.hash));
      }
    }
  }

  getEpochLengthInDays: ({ publicDeriverId: number, ...}) => ?number = publicDeriver => {
    const timeCalcRequests = this.props.stores.substores.ada.time.getTimeCalcRequests(publicDeriver);
    const { currentEpochLength, currentSlotLength } = timeCalcRequests.requests;
    const epochLengthInSeconds = currentEpochLength() * currentSlotLength();
    return epochLengthInSeconds / (60 * 60 * 24);
  };

  createWithdrawalTx: (shouldDeregister: boolean) => void = shouldDeregister => {
    const { stores } = this.props;
    const wallet = stores.wallets.selectedOrFail;
    stores.substores.ada.delegationTransaction.setShouldDeregister(shouldDeregister);
    noop(stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet }));
    stores.uiDialogs.open({
      dialog: WithdrawRewardsDialog,
    });
  };

  getStakePoolMeta: ({ publicDeriverId: number, networkId: number, ... }) => Node = (
    publicDeriver
  ) => {
    const delegationStore = this.props.stores.delegation;
    const currentPool = delegationStore.getDelegatedPoolId(publicDeriver.publicDeriverId);
    if (currentPool == null) return null;

    const poolMeta = delegationStore.getLocalPoolInfo(publicDeriver.networkId, currentPool);
    const { stake, roa, saturation, pic } = delegationStore.getLocalRemotePoolInfo(publicDeriver.networkId, currentPool) ?? {};
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
          if (poolId != null) {
            return this.props.stores.delegation.createDelegationTransaction(poolId);
          }
        }}
      />
    );
  };

  getEpochProgress: ({ publicDeriverId: number, ... }) => Node | void = publicDeriver => {
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
    const wallet = this.props.stores.wallets.selected;
    if (wallet == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    const { actions, stores } = this.props;
    const { uiDialogs, delegation: delegationStore } = stores;
    const delegationRequests = delegationStore.getDelegationRequests(wallet.publicDeriverId);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    const balance = wallet.balance;
    const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();

    const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));

    const showRewardAmount =
      errorIfPresent == null &&
        stores.delegation.isExecutedDelegatedBalance(wallet.publicDeriverId);

    const isStakeRegistered = stores.delegation.isStakeRegistered(wallet.publicDeriverId);
    const currentlyDelegating = stores.delegation.isCurrentlyDelegating(wallet.publicDeriverId);
    const delegatedUtxo = stores.delegation.getDelegatedUtxoBalance(wallet.publicDeriverId);
    const delegatedRewards = stores.delegation.getRewardBalanceOrZero(wallet);
    const isParticipatingToGovernance = stores.delegation.governanceStatus?.drepDelegation !== null;

    return (
      <Box>
        {isWalletWithNoFunds ? (
          <WalletEmptyBanner onBuySellClick={() => this.props.stores.uiDialogs.open({ dialog: BuySellDialog })} />
        ) : null}

        {currentlyDelegating ? (
          <WrapperCards>
            <SummaryCard
              onOverviewClick={() =>
                stores.uiDialogs.open({
                  dialog: OverviewModal,
                })
              }
              withdrawRewards={
                isParticipatingToGovernance === false
                  ? async () => {
                      this.props.stores.uiDialogs.open({
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
                  : new MultiToken([], wallet.balance.getDefaults());
              })()}
              graphData={generateGraphData({
                delegationRequests,
                currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(wallet).currentEpoch,
                shouldHideBalance: stores.profile.shouldHideBalance,
                getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
                tokenInfo: stores.tokenInfoStore.tokenInfo,
                networkId: wallet.networkId,
                defaultTokenId: wallet.defaultTokenId,
              })}
              onOpenRewardList={() =>
                stores.uiDialogs.open({
                  dialog: RewardHistoryDialog,
                })
              }
            />
            <RightCardsWrapper>
              {!errorIfPresent && this.getStakePoolMeta(wallet)}
              {!errorIfPresent && this.getEpochProgress(wallet)}
            </RightCardsWrapper>
          </WrapperCards>
        ) : null}

        <CardanoStakingPage
          stores={this.props.stores}
          actions={this.props.actions}
          urlTemplate={CONFIG.poolExplorer.simpleTemplate}
          poolTransition={delegationStore.getPoolTransitionInfo(wallet)}
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
                    this.props.stores.uiDialogs.open({
                      dialog: GovernanceParticipateDialog,
                    });
                  }
                : isStakeRegistered
                ? () => {
                    this.props.stores.uiDialogs.open({
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
              // note: purposely don't await since the next dialog will properly render the spinner
              noop(stores.substores.ada.delegationTransaction.createWithdrawalTxForWallet({ wallet }));
              this.props.stores.uiDialogs.open({
                // dialog: WithdrawalTxDialogContainer,
                dialog: WithdrawRewardsDialog,
              });
            }}
          />
        ) : null}
        {uiDialogs.isOpen(GovernanceParticipateDialog) ? (
          <GovernanceParticipateDialog actions={actions} stores={stores} onClose={this.onClose} intl={this.context.intl} />
        ) : null}
        {uiDialogs.isOpen(UnmangleTxDialogContainer) ? (
          <UnmangleTxDialogContainer actions={actions} stores={stores} onClose={this.onClose} />
        ) : null}
        {uiDialogs.isOpen(WithdrawalTxDialogContainer) ? (
          <WithdrawalTxDialogContainer
            actions={actions}
            stores={stores}
            onClose={() => {
              stores.substores.ada.delegationTransaction.reset({ justTransaction: false });
              this.props.actions.dialogs.closeActiveDialog.trigger();
            }}
          />
        ) : null}
        {uiDialogs.isOpen(WithdrawRewardsDialog) ? (
          <WithdrawRewardsDialog
            actions={actions}
            stores={stores}
            onClose={() => {
              stores.substores.ada.delegationTransaction.reset({ justTransaction: false });
              this.props.actions.dialogs.closeActiveDialog.trigger();
            }}
          />
        ) : null}
        {uiDialogs.isOpen(RewardHistoryDialog) ? (
          <RewardHistoryDialog
            onClose={this.onClose}
            graphData={generateGraphData({
              delegationRequests,
              currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(wallet).currentEpoch,
              shouldHideBalance: stores.profile.shouldHideBalance,
              getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
              tokenInfo: stores.tokenInfoStore.tokenInfo,
              networkId: wallet.networkId,
              defaultTokenId: wallet.defaultTokenId,
            })}
          />
        ) : null}
      </Box>
    );
  }
}

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
