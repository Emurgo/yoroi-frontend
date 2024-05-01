//@flow

export type AssetAmount = {|
  id: string,
  group: string,
  fingerprint: string,
  name: string,
  decimals: number,
  description: string,
  image: string,
  kind: string,
  ticker: string,
  amount: string,
  address?: string,
|};

export type PriceImpact = {|
  isSevere: boolean,
|};
