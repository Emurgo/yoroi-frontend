// @flow
import type { SwapPageState } from './types';
import { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
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
}: Props) {
  const [swapPageState, setState] = useState(initialSwapPageState);
  return <Context.Provider value={{ state: swapPageState }}>{children}</Context.Provider>;
}

SwapPageProvider.propTypes = {
  children: PropTypes.node,
  value: PropTypes.object,
};
