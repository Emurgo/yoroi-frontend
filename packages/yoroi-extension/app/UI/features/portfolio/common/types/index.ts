import { IChartData } from './chart';

export interface ITabButtonProps {
  id: string | number;
  label: string;
  active: boolean;
}

export interface SubMenuOption {
  label: string;
  route: string;
  className: string;
}

export type BalanceType = {
  ada: number;
  usd: number;
  percents: number;
  amount: number;
};

export interface IDetailOverview {
  description: string;
  website: string;
  detailOn: string;
  policyId: string;
  fingerprint: string;
}

export interface IDetailPerformanceItem {
  value: number | string | null;
}

export type TokenType = {
  name: string;
  id: string;
  price: number;
  portfolioPercents: number;
  '24h': number;
  '1W': number;
  '1M': number;
  totalAmount: number;
  totalAmountFiat: number;
  overview: IDetailOverview;
  performance: IDetailPerformanceItem[];
  chartData: IChartData;
};

export type LiquidityItemType = {
  id: number;
  tokenPair: string;
  DEX: string;
  DEXLink: string;
  firstToken: {
    name: string;
    id: string;
  };
  secondToken: {
    name: string;
    id: string;
  };
  lpTokens: number;
  totalValue: number;
  totalValueUsd: number;
  firstTokenValue: number;
  firstTokenValueUsd: number;
  secondTokenValue: number;
  secondTokenValueUsd: number;
};

export type OrderItemType = {
  id: number;
  pair: string;
  firstToken: {
    name: string;
    id: string;
  };
  secondToken: {
    name: string;
    id: string;
  };
  DEX: string;
  DEXLink: string;
  assetPrice: number;
  assetAmount: number;
  transactionId: string;
  totalValue: number;
  totalValueUsd: number;
};
