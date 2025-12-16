// Define types
export type StakingActions = {
};

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
};

export interface GraphItems {
  readonly name: number
  readonly primary: number
  readonly poolName: string
}


export interface RewardsGraphData {
  readonly items?: {
    readonly totalRewards: GraphItems[]
    readonly perEpochRewards: GraphItems[]
  }
  readonly hideYAxis: boolean
  readonly error?: any
}

export interface GraphData {
  readonly rewardsGraphData: RewardsGraphData
}
