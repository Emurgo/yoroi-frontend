import { DappCenterActions, DappCenterState } from '../common/types';

// Define default state
export const defaultDappCenterState: DappCenterState = {
  whitelistEntries: [],
  wallets: [],
  shouldHideBalance: false,
  getTokenInfo: () => null,
};

// Define action handlers
export const defaultDappCenterActions: DappCenterActions = {
  removeWalletFromWhitelist: (url: string) => {
    console.log('removeWalletFromWhitelist', url);
  },
};

// Reducer function
export const DappCenterReducer = (state: DappCenterState): DappCenterState => {
  return state;
};
