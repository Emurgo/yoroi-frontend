// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import type { ConfigType } from '../../../../config/config-types';
import type { TokenEntry } from '../../../api/common/lib/MultiToken';

import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import moment from 'moment';

import globalMessages from '../../../i18n/global-messages';
import { withLayout } from '../../../styles/context/layout';
import WalletEmptyBanner from '../WalletEmptyBanner';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import CardanoStakingPage from './CardanoStakingPage';
import { Box, styled } from '@mui/system';
import SummaryCard from '../../../components/wallet/staking/dashboard-revamp/SummaryCard';
import EpochProgressWrapper from '../../../components/wallet/staking/dashboard-revamp/EpochProgressWrapper';
import OverviewModal from '../../../components/wallet/staking/dashboard-revamp/OverviewDialog';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { generateGraphData } from '../../../utils/graph';
import RewardHistoryDialog from '../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';
import DelegatedStakePoolCard from '../../../components/wallet/staking/dashboard-revamp/DelegatedStakePoolCard';
import WithdrawRewardsDialog from './WithdrawRewardsDialog';
import { formatLovelacesHumanReadableShort, roundOneDecimal, roundTwoDecimal } from '../../../utils/formatters';
import { compose, maybe } from '../../../coreUtils';
import { MultiToken } from '../../../api/common/lib/MultiToken';

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
    const timeStore = this.props.stores.substores.ada.time;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver.publicDeriverId);
    await timeCalcRequests.requests.toAbsoluteSlot.execute().promise;
    await timeCalcRequests.requests.toRealTime.execute().promise;
    await timeCalcRequests.requests.currentEpochLength.execute().promise;
    await timeCalcRequests.requests.currentSlotLength.execute().promise;
    await timeCalcRequests.requests.timeSinceGenesis.execute().promise;
  }

  getEpochLengthInDays: (number) => ?number = publicDeriverId => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriverId);
    const getEpochLength = timeCalcRequests.requests.currentEpochLength.result;
    if (getEpochLength == null) return null;

    const getSlotLength = timeCalcRequests.requests.currentSlotLength.result;
    if (getSlotLength == null) return null;

    const epochLengthInSeconds = getEpochLength() * getSlotLength();
    const epochLengthInDays = epochLengthInSeconds / (60 * 60 * 24);
    return epochLengthInDays;
  };

  createWithdrawalTx: (shouldDeregister: boolean) => void = shouldDeregister => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    this.props.actions.ada.delegationTransaction.setShouldDeregister.trigger(shouldDeregister);
    const { delegationTransaction } = this.props.actions.ada;
    delegationTransaction.createWithdrawalTxForWallet.trigger({ wallet: publicDeriver });
    this.props.actions.dialogs.open.trigger({
      dialog: WithdrawRewardsDialog,
    });
  };

  getStakePoolMeta: (number, number) => Node = (publicDeriverId, networkId) => {
    const delegationStore = this.props.stores.delegation;
    const currentPool = delegationStore.getDelegatedPoolId(publicDeriverId);
    if (currentPool == null) return null;

    const poolMeta = delegationStore.getLocalPoolInfo(networkId, currentPool);
    const { stake, roa, saturation, pic } = delegationStore.getLocalRemotePoolInfo(networkId, currentPool) ?? {};
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
      share: maybe(saturation, s => roundOneDecimal(Number(s)*100)),
      websiteUrl: poolMeta.info?.homepage,
      ticker: poolMeta.info?.ticker,
    };
    return (
      <DelegatedStakePoolCard
        delegatedPool={delegatedPool}
        undelegate={async () => this.createWithdrawalTx(true)} // shouldDeregister=true
      />
    );
  };

  getEpochProgress: (number) => Node | void = publicDeriverId => {
    const timeStore = this.props.stores.substores.ada.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriverId);
    const currTimeRequests = timeStore.getCurrentTimeRequests(publicDeriverId);
    const toAbsoluteSlot = timeCalcRequests.requests.toAbsoluteSlot.result;
    if (toAbsoluteSlot == null) return undefined;
    const toRealTime = timeCalcRequests.requests.toRealTime.result;
    if (toRealTime == null) return undefined;
    const timeSinceGenesis = timeCalcRequests.requests.timeSinceGenesis.result;
    if (timeSinceGenesis == null) return undefined;
    const getEpochLength = timeCalcRequests.requests.currentEpochLength.result;
    if (getEpochLength == null) return undefined;
    const currentEpoch = currTimeRequests.currentEpoch;
    const epochLength = getEpochLength();

    const getDateFromEpoch = (epoch, returnEpochTime = false) => {
      const epochTime = toRealTime({
        absoluteSlotNum: toAbsoluteSlot({
          epoch,
          // Rewards are calculated at the start of the epoch but distributed at the end
          slot: getEpochLength(),
        }),
        timeSinceGenesisFunc: timeSinceGenesis,
      });

      if (returnEpochTime) return epochTime;

      const epochMoment = moment(epochTime).format('lll');
      return epochMoment;
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
    const tokenRow = stores.tokenInfoStore.tokenInfo
      .get(entry.networkId.toString())
      ?.get(entry.identifier);
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
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver.publicDeriverId);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    const balance = publicDeriver.balance;
    const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();

    const errorIfPresent = maybe(delegationRequests.error, error => ({ error }));

    const showRewardAmount = errorIfPresent == null
      && stores.delegation.isExecutedDelegatedBalance(publicDeriver.publicDeriverId);

    const isStakeRegistered = stores.delegation.isStakeRegistered(publicDeriver.publicDeriverId);
    const currentlyDelegating = stores.delegation.isCurrentlyDelegating(publicDeriver.publicDeriverId);
    const delegatedUtxo = stores.delegation.getDelegatedUtxoBalance(publicDeriver.publicDeriverId);
    const delegatedRewards = stores.delegation.getRewardBalanceOrZero(publicDeriver);
    const defaultMultiToken = new MultiToken(
      [],
      {
        defaultNetworkId: publicDeriver.networkId,
        defaultIdentifier: publicDeriver.defaultTokenId,
      }
    );

    return (
      <Box>
        {isWalletWithNoFunds ? (
          <WalletEmptyBanner
            onBuySellClick={() =>
              this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })
            }
          />
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
                isStakeRegistered
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
                  : defaultMultiToken;
              })()}
              graphData={generateGraphData({
                delegationRequests,
                currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(
                  publicDeriver.publicDeriverId
                ).currentEpoch,
                shouldHideBalance: stores.profile.shouldHideBalance,
                getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
                tokenInfo: stores.tokenInfoStore.tokenInfo,
                networkId: publicDeriver.networkId,
                defaultTokenId: publicDeriver.defaultTokenId,
              })}
              onOpenRewardList={() =>
                actions.dialogs.open.trigger({
                  dialog: RewardHistoryDialog,
                })
              }
            />
            <RightCardsWrapper>
              {errorIfPresent}
              {!errorIfPresent && this.getStakePoolMeta(publicDeriver.publicDeriverId, publicDeriver.networkId)}
              {!errorIfPresent && this.getEpochProgress(publicDeriver.publicDeriverId)}
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
              isStakeRegistered
                ? () => {
                    this.props.actions.dialogs.open.trigger({
                      dialog: DeregisterDialogContainer,
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
              delegationTransaction.createWithdrawalTxForWallet.trigger({ wallet: publicDeriver });
              this.props.actions.dialogs.open.trigger({
                // dialog: WithdrawalTxDialogContainer,
                dialog: WithdrawRewardsDialog,
              });
            }}
          />
        ) : null}
        {uiDialogs.isOpen(UnmangleTxDialogContainer) ? (
          <UnmangleTxDialogContainer
            actions={actions}
            stores={stores}
            onClose={this.onClose}
          />
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
              currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(
                publicDeriver.publicDeriverId
              ).currentEpoch,
              shouldHideBalance: stores.profile.shouldHideBalance,
              getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
              tokenInfo: stores.tokenInfoStore.tokenInfo,
              networkId: publicDeriver.networkId,
              defaultTokenId: publicDeriver.defaultTokenId,
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
