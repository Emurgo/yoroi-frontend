// @flow
import type { ComponentType, Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { InjectedProps } from '../../../types/injectedPropsType';
import type { LayoutComponentMap } from '../../../styles/context/layout';
import type { ConfigType } from '../../../../config/config-types';
import type { DelegationRequests } from '../../../stores/toplevel/DelegationStore';
import type { TokenEntry } from '../../../api/common/lib/MultiToken';

import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import moment from 'moment';

import globalMessages from '../../../i18n/global-messages';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver/index';
import { withLayout } from '../../../styles/context/layout';
import WalletEmptyBanner from '../WalletEmptyBanner';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import CardanoStakingPage from './CardanoStakingPage';
import { Box, styled } from '@mui/system';
import SummaryCard from '../../../components/wallet/staking/dashboard-revamp/SummaryCard';
import EpochProgressWrapper from '../../../components/wallet/staking/dashboard-revamp/EpochProgressWrapper';
import OverviewModal from '../../../components/wallet/staking/dashboard-revamp/OverviewDialog';
import LocalizableError from '../../../i18n/LocalizableError';
import { MultiToken } from '../../../api/common/lib/MultiToken';
import { genLookupOrFail } from '../../../stores/stateless/tokenHelpers';
import UnmangleTxDialogContainer from '../../transfer/UnmangleTxDialogContainer';
import DeregisterDialogContainer from '../../transfer/DeregisterDialogContainer';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { isCardanoHaskell } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import WithdrawalTxDialogContainer from '../../transfer/WithdrawalTxDialogContainer';
import { generateGraphData } from '../../../utils/graph';
import RewardHistoryDialog from '../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';
import DelegatedStakePoolCard from '../../../components/wallet/staking/dashboard-revamp/DelegatedStakePoolCard';
import WithdrawRewardsDialog from './WithdrawRewardsDialog';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
type Props = {|
  ...InjectedProps,
  actions: any,
  stores: any,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
|};

type AllProps = {| ...Props, ...InjectedLayoutProps |};
@observer
class StakingPageContent extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  onClose: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
  };

  _isRegistered: (PublicDeriver<>) => ?boolean = publicDeriver => {
    if (!isCardanoHaskell(publicDeriver.getParent().getNetworkInfo())) {
      return undefined;
    }
    const delegationRequests = this.props.stores.delegation.getDelegationRequests(
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

  async componentDidMount() {
    const timeStore = this.props.stores.time;
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
    await timeCalcRequests.requests.toAbsoluteSlot.execute().promise;
    await timeCalcRequests.requests.toRealTime.execute().promise;
    await timeCalcRequests.requests.currentEpochLength.execute().promise;
    await timeCalcRequests.requests.currentSlotLength.execute().promise;
    await timeCalcRequests.requests.timeSinceGenesis.execute().promise;
  }

  getErrorInFetch: (PublicDeriver<>) => void | {| error: LocalizableError |} = publicDeriver => {
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    if (delegationRequests.error != null) {
      return { error: delegationRequests.error };
    }
    return undefined;
  };

  getEpochLengthInDays: (PublicDeriver<>) => ?number = publicDeriver => {
    const timeStore = this.props.stores.time;
    const timeCalcRequests = timeStore.getTimeCalcRequests(publicDeriver);
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
    delegationTransaction.createWithdrawalTxForWallet.trigger({ publicDeriver });
    this.props.actions.dialogs.open.trigger({
      dialog: WithdrawRewardsDialog,
    });
  };

  getUserSummary: ({|
    delegationRequests: DelegationRequests,
    publicDeriver: PublicDeriver<>,
    errorIfPresent: void | {| error: LocalizableError |},
  |}) => Node = request => {
    const publicDeriver = this.props.stores.wallets.selected;
    if (publicDeriver == null) {
      throw new Error(`${nameof(StakingPageContent)} no public deriver. Should never happen`);
    }

    const { actions, stores } = this.props;

    const showRewardAmount =
      request.delegationRequests.getDelegatedBalance.wasExecuted && request.errorIfPresent == null;

    const defaultToken = request.publicDeriver.getParent().getDefaultToken();

    const currentlyDelegating =
      request.delegationRequests.getDelegatedBalance.result?.delegation != null;

    return (
      <SummaryCard
        onOverviewClick={() =>
          actions.dialogs.open.trigger({
            dialog: OverviewModal,
          })
        }
        withdrawRewards={
          this._isRegistered(request.publicDeriver) === true
            ? async () => this.createWithdrawalTx(false) // shouldDeregister=false
            : undefined
        }
        unitOfAccount={this.toUnitOfAccount}
        getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
        shouldHideBalance={stores.profile.shouldHideBalance}
        totalRewards={
          !showRewardAmount || request.delegationRequests.getDelegatedBalance.result == null
            ? undefined
            : request.delegationRequests.getDelegatedBalance.result.accountPart
        }
        totalDelegated={(() => {
          if (!showRewardAmount) return undefined;
          if (request.delegationRequests.getDelegatedBalance.result == null) return undefined;

          return currentlyDelegating
            ? request.delegationRequests.getDelegatedBalance.result.utxoPart.joinAddCopy(
                request.delegationRequests.getDelegatedBalance.result.accountPart
              )
            : new MultiToken([], defaultToken);
        })()}
        graphData={generateGraphData({
          delegationRequests: request.delegationRequests,
          publicDeriver: request.publicDeriver,
          currentEpoch: stores.time.getCurrentTimeRequests(request.publicDeriver).currentEpoch,
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
    );
  };

  getStakePoolMeta: (PublicDeriver<>) => Node = publicDeriver => {
    const delegationStore = this.props.stores.delegation;
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    if (
      !delegationRequests.getDelegatedBalance.wasExecuted ||
      delegationRequests.getDelegatedBalance.isExecuting ||
      delegationRequests.getDelegatedBalance.result == null
    ) {
      return null;
    }

    if (delegationRequests.getDelegatedBalance.result.delegation == null) return null;
    const currentPool = delegationRequests.getDelegatedBalance.result.delegation;
    const meta = this.props.stores.delegation.getLocalPoolInfo(
      publicDeriver.getParent().getNetworkInfo(),
      currentPool
    );
    if (meta == null) {
      // server hasn't returned information about the stake pool yet
      return null;
    }
    const { intl } = this.context;
    const name = meta.info?.name ?? intl.formatMessage(globalMessages.unknownPoolLabel);
    // TODO: remove placeholders
    const delegatedPool = {
      id: String(currentPool),
      name,
      roa: '-',
      poolSize: '-',
      share: '-',
      websiteUrl: meta.info?.homepage,
      ticker: meta.info?.ticker,
    };

    // TODO: implement this eventually
    // const stakePoolMeta = {
    // avatar: '',
    // websiteUrl: '',
    // roa: ' 5.08%',
    // socialLinks: {
    //   fb: '',
    //   tw: '',
    //  },
    // };

    return (
      <DelegatedStakePoolCard
        delegatedPool={delegatedPool}
        undelegate={async () => this.createWithdrawalTx(true)} // shouldDeregister=true
      />
    );
  };

  getEpochProgress: (PublicDeriver<>) => Node | void = publicDeriver => {
    const timeStore = this.props.stores.time;
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
    const delegationRequests = delegationStore.getDelegationRequests(publicDeriver);
    if (delegationRequests == null) {
      throw new Error(`${nameof(StakingPageContent)} opened for non-reward wallet`);
    }
    const balance = stores.transactions.getBalance(publicDeriver);
    const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();

    const errorIfPresent = this.getErrorInFetch(publicDeriver);

    const showRewardAmount =
      delegationRequests.getDelegatedBalance.wasExecuted && errorIfPresent == null;

    return (
      <Box>
        {isWalletWithNoFunds ? (
          <WalletEmptyBanner
            onBuySellClick={() =>
              this.props.actions.dialogs.open.trigger({ dialog: BuySellDialog })
            }
          />
        ) : null}

        {this._isRegistered(publicDeriver) ? (
          <WrapperCards>
            {this.getUserSummary({ delegationRequests, publicDeriver, errorIfPresent })}
            <RightCardsWrapper>
              {errorIfPresent}
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
            totalRewards={
              !showRewardAmount || delegationRequests.getDelegatedBalance.result == null
                ? undefined
                : delegationRequests.getDelegatedBalance.result.accountPart
            }
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            unitOfAccount={this.toUnitOfAccount}
            withdrawRewards={
              this._isRegistered(delegationRequests.publicDeriver) === true
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
              delegationTransaction.createWithdrawalTxForWallet.trigger({ publicDeriver });
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
              publicDeriver,
              currentEpoch: stores.time.getCurrentTimeRequests(publicDeriver).currentEpoch,
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
export default (withLayout(StakingPageContent): ComponentType<Props>);

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
