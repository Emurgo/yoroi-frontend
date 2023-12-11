// @flow
import type { SwapFormContext } from './types';
import { createContext } from 'react';
import { defaultSwapFormState } from './SwapFormProvider';

function missingInit() {
  console.error('[SwapFormContext] missing initialization');
}

const initialSwapFormContext: SwapFormContext = {
  ...defaultSwapFormState,
  sellTouched: missingInit,
  buyTouched: missingInit,
  poolTouched: missingInit,
  poolDefaulted: missingInit,
  switchTouched: missingInit,
  switchTokens: missingInit,
  clearSwapForm: missingInit,
  resetSwapForm: missingInit,
  buyInputValueChanged: missingInit,
  sellInputValueChanged: missingInit,
  limitPriceInputValueChanged: missingInit,
  buyAmountErrorChanged: missingInit,
  sellAmountErrorChanged: missingInit,
  canSwapChanged: missingInit,
  sellInputRef: undefined,
  buyInputRef: undefined,
  limitInputRef: undefined,
  onChangeSellQuantity: missingInit,
  onChangeBuyQuantity: missingInit,
  onChangeLimitPrice: missingInit,
};

const context = createContext<SwapFormContext>(initialSwapFormContext);
export default context;
