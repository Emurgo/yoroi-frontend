//@flow
import { createContext } from 'react';
import type { SwapPageState } from './types';

const defaultSwapPageContext: SwapPageState = {
  stores: {},
};

// $FlowFixMe
const context = createContext(defaultSwapPageContext);
export default context;
