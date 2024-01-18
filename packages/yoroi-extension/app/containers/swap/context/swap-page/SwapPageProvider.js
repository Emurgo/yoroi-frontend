// @flow
import type { Node } from 'react';
import type { SwapPageState } from './types';
import { useState } from 'react';
import Context from './context';

const defaultSwapPageState: SwapPageState = {
  stores: {},
};

type Props = {|
  initialSwapPageState: SwapPageState,
  children: any,
|};

export default function SwapPageProvider({
  initialSwapPageState = defaultSwapPageState,
  children,
}: Props): Node {
  const [swapPageState] = useState(initialSwapPageState);
  return <Context.Provider value={{ state: swapPageState }}>{children}</Context.Provider>;
}
