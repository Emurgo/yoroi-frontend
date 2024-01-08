//@flow
import type { Node } from 'react';

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
|};
