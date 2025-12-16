import type { StoresMap } from '../../../../stores/index';
import * as React from 'react';
import { defaultStakingState, defaultStakingActions } from './state';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { observer } from 'mobx-react';
import { generateGraphData } from '../common/helpers/graph';
import { GraphData } from '../common/types';
import { networkConfigs } from '../../../utils/network-config';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import RewardHistoryDialog from '../../../../components/wallet/staking/dashboard-revamp/RewardHistoryDialog';

const initialStakingProvider = {
  ...defaultStakingState,
  ...defaultStakingActions,
};
const StakingContext = React.createContext(initialStakingProvider);

type StakingProviderProps = {
  children: React.ReactNode;
  stores: StoresMap;
};

export const StakingContextProvider = observer(({ children, stores }: StakingProviderProps) => {
  const { wallets, profile, tokenInfoStore, delegation: delegationStore } = stores;
  const [graphData, setGraphData] = React.useState<GraphData | null>(null);
  if (!wallets.selected) throw new Error(`requires a wallet to be selected`);
  const selectedWallet = wallets.selected;

  const networkId = selectedWallet.networkId;
  const primaryTokenInfo = networkConfigs[networkId].primaryTokenInfo;
  const showRewardAmount = stores.delegation.isExecutedDelegatedBalance(selectedWallet.publicDeriverId);
  const delegatedRewards = showRewardAmount ? stores.delegation.getRewardBalanceOrZero(selectedWallet) : undefined;
  const currentlyDelegating = stores.delegation.isCurrentlyDelegating(selectedWallet.publicDeriverId);
  const delegatedUtxo = stores.delegation.getDelegatedUtxoBalance(selectedWallet.publicDeriverId);
  const delegationRequests = delegationStore.getDelegationRequests(selectedWallet.publicDeriverId);

  if (delegationRequests == null) {
    throw new Error(`Page opened for non-reward wallet`);
  }

  React.useEffect(() => {
    const historyGraphData = generateGraphData({
      delegationRequests,
      currentEpoch: stores.substores.ada.time.getCurrentTimeRequests(selectedWallet).currentEpoch,
      shouldHideBalance: stores.profile.shouldHideBalance,
      getLocalPoolInfo: stores.delegation.getLocalPoolInfo,
      tokenInfo: stores.tokenInfoStore.tokenInfo,
      networkId: selectedWallet.networkId,
      defaultTokenId: selectedWallet.defaultTokenId,
    });
    setGraphData(historyGraphData);
  }, [delegationRequests, selectedWallet, currentlyDelegating]);

  const totalDelegated = () => {
    if (!showRewardAmount) return undefined;

    return currentlyDelegating
      ? maybe(delegatedUtxo, w => delegatedRewards.joinAddCopy(w))
      : new MultiToken([], selectedWallet.balance.getDefaults());
  };

  const toUnitOfAccount = entry => {
    const tokenRow = stores.tokenInfoStore.tokenInfo.get(entry.networkId.toString())?.get(entry.identifier);
    if (tokenRow == null) return undefined;

    if (!stores.profile.unitOfAccount.enabled) return undefined;

    const currency: string = stores.profile.unitOfAccount.currency;

    const shiftedAmount = entry.amount.shiftedBy(-tokenRow.Metadata.numberOfDecimals);

    const ticker: string | null | undefined = tokenRow.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }

    const coinPrice = stores.coinPriceStore.getCurrentPrice(ticker, currency);
    if (coinPrice == null) {
      return { currency, amount: '-' };
    }

    return {
      currency,
      amount: formatValue(shiftedAmount.multipliedBy(coinPrice)),
    };
  };

  const onOpenRewardList = () => {
    stores.uiDialogs.open({
      dialog: RewardHistoryDialog,
    });
  };

  const initialState = {
    selectedWallet: selectedWallet,
    shouldHideBalance: profile.shouldHideBalance,
    tokenInfo: tokenInfoStore.tokenInfo,
    stores: stores,
    totalRewards: delegatedRewards,
    totalDelegated: totalDelegated(),
    historyGraphData: graphData,
    primaryTokenInfo,
    toUnitOfAccount,
    onOpenRewardList,
  };

  const state = React.useMemo(
    () => ({
      ...defaultStakingState,
      ...initialState,
    }),
    [initialState]
  );

  React.useEffect(() => {}, [stores]);

  const actions = React.useRef({
    getTokenInfo: genLookupOrFail(tokenInfoStore.tokenInfo),
  }).current;

  const context = React.useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions]
  );

  return <StakingContext.Provider value={context}>{children}</StakingContext.Provider>;
});

export const useStaking = () =>
  React.useContext(StakingContext) ?? console.log('useStaking: needs to be wrapped in a StakingProvider');

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}

export function maybe<T, R>(value: T | null | undefined, fn: (value: T) => R | null | undefined): R | null | undefined {
  return value == null ? undefined : fn(value);
}