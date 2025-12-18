import type { ExplorerPoolInfo as PoolInfo } from '@emurgo/yoroi-lib';
export type StakingActions = {};

// Define state type
export type StakingState = {
  wallets: any;
  shouldHideBalance: boolean;
  getTokenInfo: (address: string) => any;
  stores: any;
  onOpenRewardList: () => void;
  totalRewards: any;
  totalDelegated: any;
  historyGraphData: GraphData | null;
  primaryTokenInfo: any;
  toUnitOfAccount: (entry: any) => void | { currency: string; amount: string };
  defaultDelegatedAsset: any;
  selectedWallet: any;
  delegationStore: any;
  legacyUIDialogs: any;
  delegationRequests: any;
  isWalletWithNoFunds: boolean;
  currentlyDelegating: boolean;
};

export interface GraphItems {
  readonly name: number;
  readonly primary: number;
  readonly poolName: string;
}

export interface RewardsGraphData {
  readonly items?: {
    readonly totalRewards: GraphItems[];
    readonly perEpochRewards: GraphItems[];
  };
  readonly hideYAxis: boolean;
  readonly error?: any;
}

export interface GraphData {
  readonly rewardsGraphData: RewardsGraphData;
}

export interface SocialLinks {
  tw?: string;
  fb?: string;
  gh?: string;
  tc?: string;
  tg?: string;
  di?: string;
  yt?: string;
  web?: string;
  icon?: string;
}

export interface PoolData {
  id: string;
  name: string;
  ticker?: string;
  avatar?: string | null;
  roa?: string | null;
  poolSize?: string | null;
  share?: string | null;
  websiteUrl?: string;
  socialLinks?: SocialLinks;
}

export interface PoolTransition {
  currentPool?: PoolInfo | null;
  deadlineMilliseconds?: number | null;
  shouldShowTransitionFunnel: boolean;
  suggestedPool?: PoolInfo | null;
  deadlinePassed: boolean;
}
