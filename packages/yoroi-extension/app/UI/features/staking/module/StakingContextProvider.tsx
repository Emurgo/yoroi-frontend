import type { StoresMap } from '../../../../stores/index';
import * as React from 'react';
import { defaultStakingState, defaultStakingActions } from './state';
import { genLookupOrFail } from '../../../../stores/stateless/tokenHelpers';
import { observer } from 'mobx-react';
import { generateGraphData } from '../common/helpers/graph';
import { GraphData } from '../common/types';
import { networkConfigs } from '../../../utils/network-config';
import { MultiToken } from '../../../../api/common/lib/MultiToken';
import { getDefaultAssetByWallet } from '../../../../api/ada/lib/storage/database/prepackaged/networks';
import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';

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
  const currentPool = delegationStore.getDelegatedPoolId(selectedWallet.publicDeriverId);
  const balance = selectedWallet.balance;
  const isWalletWithNoFunds = balance != null && balance.getDefaultEntry().amount.isZero();

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

  const defaultDelegatedAsset = getDefaultAssetByWallet(selectedWallet);

  const initialState = {
    selectedWallet: selectedWallet, // TODO - to be replaced by hook - useSelectedWallet
    delegationStore: delegationStore, // TODO - to be replaced by hook - useDelegation
    legacyUIDialogs: stores.uiDialogs, // TODO - to be replaced by individual hooks - maybe create useUiDialogs hook until will remoeve mobx
    stores: stores, // TODO - to be replaced by individual hooks - maybe create useStores hook until will remoeve mobx
    shouldHideBalance: profile.shouldHideBalance,
    tokenInfo: tokenInfoStore.tokenInfo,
    totalRewards: delegatedRewards,
    totalDelegated: totalDelegated(),
    historyGraphData: graphData,
    primaryTokenInfo,
    toUnitOfAccount,
    defaultDelegatedAsset,
    currentPool,
    delegationRequests,
    isWalletWithNoFunds,
  };

  const state = React.useMemo(
    () => ({
      ...defaultStakingState,
      ...initialState,
    }),
    [initialState, currentPool]
  );

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

// Legacy utility functions - to be moved refactored later
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

export function roundTwoDecimal(num: number): string {
  const fNum = Number(num);
  return (Math.round(fNum * 100) / 100).toFixed(2);
}

export function formatLovelacesHumanReadableShort(num: string): string {
  const fNum = Number(num) / 1000000; // divided in 1,000,000 to convert from Lovelace to ADA
  if (fNum >= 1e3) {
    const units = ['k', 'M', 'B', 'T'];
    // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
    const unit = Math.floor((fNum.toFixed(0).length - 1) / 3) * 3;
    // Calculate the remainder
    const formattedNum = (fNum / Number(`1e${unit}`)).toFixed(2);
    const unitname = units[Math.floor(unit / 3) - 1];
    return `${formattedNum}${unitname}`;
  }
  return fNum.toLocaleString();
}

export function roundOneDecimal(num: number): string {
  const fNum = Number(num);
  const number = Math.round(fNum * 10) / 10;
  if (number === 0) return number.toFixed(1);
  return number.toString();
}

export function poolIdHexToBech32(hex: string): string {
  return RustModule.WasmScope(Module => Module.WalletV4.Ed25519KeyHash.from_hex(hex).to_bech32('pool'));
}
