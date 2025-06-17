// Define types
export type DappCenterActions = {
  removeWalletFromWhitelist: (url: string) => void;
};

// Define state type
export type DappCenterState = {
  whitelistEntries: any;
  wallets: any;
  shouldHideBalance: boolean;
  getTokenInfo: (address: string) => any;
};
