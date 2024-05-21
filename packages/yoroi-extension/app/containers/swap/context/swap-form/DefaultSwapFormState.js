// @flow
import type { SwapFormState } from './types';

export const defaultSwapFormState: SwapFormState = Object.freeze({
  sellQuantity: {
    isTouched: false,
    disabled: false,
    error: null,
    displayValue: '',
  },
  buyQuantity: {
    isTouched: false,
    disabled: false,
    error: null,
    displayValue: '',
  },
  sellTokenInfo: {
    tokenId: '',
  },
  buyTokenInfo: {
    tokenId: '',
  },
  selectedPool: { isTouched: false },
  limitPrice: { displayValue: '' },
  canSwap: false,
});