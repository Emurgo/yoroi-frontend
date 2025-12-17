import { StakingActions, StakingState } from '../common/types';

// Define default state
export const defaultStakingState: StakingState = {
  wallets: [],
  shouldHideBalance: false,
  getTokenInfo: () => null,
  stores: null,
  onOpenRewardList: () => {},
  totalRewards: null,
  totalDelegated: null,
  historyGraphData: null,
  primaryTokenInfo: null,
  toUnitOfAccount: () => ({ currency: '', amount: '' }),
  defaultDelegatedAsset: null,
  selectedWallet: null,
  delegationStore: null,
  legacyUIDialogs: null,
  delegationRequests: null,
  isWalletWithNoFunds: false,
};

// Define action handlers
export const defaultStakingActions: StakingActions = {};

// Reducer function
export const StakingReducer = (state: StakingState): StakingState => {
  return state;
};
