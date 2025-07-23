import BigNumber from "bignumber.js";

type UnitOfAccount = {
  enabled: boolean;
  currency: string;
};

type DefaultTokenInfo = {
  ticker: string;
  name: string;
  decimals: number;
};

// type Metadata = {
//   type: string;
//   policyId: string;
//   assetName: string;
//   ticker: string;
//   logo: string | null;
//   longName: string | null;
//   numberOfDecimals: number;
// };

type PrimaryTokenInfo = any; // TODO - define the structure of PrimaryTokenInfo

export type WalletBalance = {
  ada: string;
};

export type CurrentWalletType = {
  currentPool: any;
  networkId: number;
  walletId: number;
  selectedWallet: any;
  walletAdaBalance: number;
  unitOfAccount: UnitOfAccount;
  defaultTokenInfo: DefaultTokenInfo;
  recentTransactions: any[]; // Define the structure of transactions if needed
  submitedTransactions: any[]; // Define the structure of transactions if needed
  backendService: string;
  backendServiceZero: string;
  stakingAddress: string;
  isHardwareWallet: boolean;
  primaryTokenInfo: PrimaryTokenInfo;
  walletBalance: WalletBalance;
  ftAssetList: any[];
  allAssetList: any[];
  nftAssetList: any[];
  explorer: { tokenInfo: { name: string; baseUrl: string } }; // TODO to be removed
  selectedExplorer: any;
  stakingRewards: BigNumber;
  walletAddresses: string;
  isStakeRegistered: boolean;
  walletType: 'ledger' | 'trezor';
};
