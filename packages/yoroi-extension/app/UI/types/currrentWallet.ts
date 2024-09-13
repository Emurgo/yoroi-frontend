type UnitOfAccount = {
  enabled: boolean;
  currency: string;
};

type DefaultTokenInfo = {
  ticker: string;
  name: string;
  decimals: number;
};

type Metadata = {
  type: string;
  policyId: string;
  assetName: string;
  ticker: string;
  logo: string | null;
  longName: string | null;
  numberOfDecimals: number;
};

type PrimaryTokenInfo = {
  TokenId: number;
  NetworkId: number;
  IsDefault: boolean;
  IsNFT: boolean;
  Identifier: string;
  Digest: number;
  Metadata: Metadata;
};

export type WalletBalance = {
  ada: string;
  fiatAmount: string;
  currency: string;
};

type GetCurrentPrice = (from: string, to: string) => number | Promise<number>; // Function type for getCurrentPrice

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
  isHardwareWallet: boolean;
  primaryTokenInfo: PrimaryTokenInfo;
  walletBalance: WalletBalance;
  getCurrentPrice: GetCurrentPrice; // Added the function type here
  assetList: any[];
};
