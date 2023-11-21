//@flow
import type { Node } from 'react';

export type AssetAmount = {|
  ticker: string,
  amount: string,
  walletAmount: number,
  image: Node | null,
  address: string,
  name: string,
|};