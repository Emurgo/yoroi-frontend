import type { SwapFormState, SwapFormAction } from './types';
import type { AssetAmount } from '../../../../components/swap/types';
import { SwapFormActionTypeValues } from './types';
import { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useSwap } from '@yoroi/swap';
// import { Quantities } from '../../../../utils/quantities';
import PropTypes from 'prop-types';
import Context from './context';

const PRECISION = 14;

export const defaultSwapFormState: SwapFormState = Object.freeze({
  sellQuantity: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  buyQuantity: {
    isTouched: false,
    disabled: false,
    error: undefined,
    displayValue: '',
  },
  sellTokenInfo: {},
  buyTokenInfo: {},
  selectedPool: { isTouched: false },
  limitPrice: { displayValue: '' },
  canSwap: false,
});

export default function SwapFormProvider({ initialSwapFormProvider, children }) {
  const {
    orderData,
    resetState,
    buyQuantityChanged,
    sellQuantityChanged,
    switchTokens,
    limitPriceChanged,
    resetQuantities,
  } = useSwap();

  const swapFormReducer = (state: SwapFormState, action: SwapFormAction) => {
    const draft = Object.assign({}, { ...state });

    switch (action.type) {
      case SwapFormActionTypeValues.ResetSwapForm:
        return defaultSwapFormState;
      case SwapFormActionTypeValues.ClearSwapForm:
        return Object.assign({}, state);
      case SwapFormActionTypeValues.SellTouched:
        draft.sellQuantity.isTouched = true;
        draft.sellQuantity.displayValue = '';
        draft.sellQuantity.error = undefined;
        draft.sellTokenInfo = action.token;
        break;
      case SwapFormActionTypeValues.BuyTouched:
        draft.buyQuantity.isTouched = true;
        draft.buyQuantity.displayValue = '';
        draft.buyQuantity.error = undefined;
        draft.buyTokenInfo = action.token;
        break;
      case SwapFormActionTypeValues.SwitchTouched:
        const sellTokenInfo = { ...state.sellTokenInfo };
        const buyTokenInfo = { ...state.buyTokenInfo };
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched;
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched;
        draft.sellQuantity.displayValue = state.buyQuantity.displayValue;
        draft.buyQuantity.displayValue = state.sellQuantity.displayValue;
        draft.buyTokenInfo = sellTokenInfo;
        draft.sellTokenInfo = buyTokenInfo;
        draft.sellQuantity.error = undefined;
        draft.buyQuantity.error = undefined;
        break;
      case SwapFormActionTypeValues.PoolTouched:
        draft.selectedPool.isTouched = true;
        break;
      case SwapFormActionTypeValues.PoolDefaulted:
        draft.selectedPool = defaultSwapFormState.selectedPool;
        break;
      case SwapFormActionTypeValues.CanSwapChanged:
        draft.canSwap = action.canSwap;
        break;
      case SwapFormActionTypeValues.SellInputValueChanged:
        if (state.sellQuantity.isTouched) draft.sellQuantity.displayValue = action.value;
        break;
      case SwapFormActionTypeValues.BuyInputValueChanged:
        if (state.buyQuantity.isTouched) draft.buyQuantity.displayValue = action.value;
        break;
      case SwapFormActionTypeValues.LimitPriceInputValueChanged:
        draft.limitPrice.displayValue = action.value;
        break;
      case SwapFormActionTypeValues.SellAmountErrorChanged:
        draft.sellQuantity.error = action.error;
        break;
      case SwapFormActionTypeValues.BuyAmountErrorChanged:
        draft.buyQuantity.error = action.error;
        break;
      default:
        throw new Error(`swapFormReducer invalid action`);
    }
    return draft;
  };

  const [swapFormState, dispatch] = useReducer(swapFormReducer, {
    ...defaultSwapFormState,
    ...initialSwapFormProvider,
  });

  const actions = {
    sellTouched: (token?: AssetAmount) =>
      dispatch({ type: SwapFormActionTypeValues.SellTouched, token }),
    buyTouched: (token?: AssetAmount) =>
      dispatch({ type: SwapFormActionTypeValues.BuyTouched, token }),
    switchTouched: () => dispatch({ type: SwapFormActionTypeValues.SwitchTouched }),
    switchTokens: () => {
      switchTokens();
      dispatch({ type: SwapFormActionTypeValues.SwitchTouched });
    },
    poolTouched: () => dispatch({ type: SwapFormActionTypeValues.PoolTouched }),
    poolDefaulted: () => dispatch({ type: SwapFormActionTypeValues.PoolDefaulted }),
    clearSwapForm: () => {
      resetQuantities();
      dispatch({ type: SwapFormActionTypeValues.ClearSwapForm });
    },
    resetSwapForm: () => {
      resetState();
      dispatch({ type: SwapFormActionTypeValues.ResetSwapForm });
    },
    canSwapChanged: (canSwap: boolean) =>
      dispatch({ type: SwapFormActionTypeValues.CanSwapChanged, canSwap }),
    buyInputValueChanged: (value: string) =>
      dispatch({ type: SwapFormActionTypeValues.BuyInputValueChanged, value }),
    sellInputValueChanged: (value: string) =>
      dispatch({ type: SwapFormActionTypeValues.SellInputValueChanged, value }),
    limitPriceInputValueChanged: (value: string) =>
      dispatch({ type: SwapFormActionTypeValues.LimitPriceInputValueChanged, value }),
    buyAmountErrorChanged: (error: string | undefined) =>
      dispatch({ type: SwapFormActionTypeValues.BuyAmountErrorChanged, error }),
    sellAmountErrorChanged: (error: string | undefined) =>
      dispatch({ type: SwapFormActionTypeValues.SellAmountErrorChanged, error }),
  };

  const clearErrors = useCallback(() => {
    if (swapFormState.sellQuantity.error !== undefined) actions.sellAmountErrorChanged(undefined);
    if (swapFormState.buyQuantity.error !== undefined) actions.buyAmountErrorChanged(undefined);
  }, [actions, swapFormState.buyQuantity.error, swapFormState.sellQuantity.error]);

  const onChangeSellQuantity = useCallback(
    (text: string) => {
      sellQuantityChanged(Number(text));
      actions.sellInputValueChanged(text === '' ? '' : text);

      clearErrors();
    },
    [actions, clearErrors, sellQuantityChanged]
  );

  const onChangeBuyQuantity = useCallback(
    (text: string) => {
      buyQuantityChanged(Number(text));
      actions.buyInputValueChanged(text === '' ? '' : text);

      clearErrors();
    },
    [buyQuantityChanged, actions, clearErrors]
  );

  const allActions = { ...actions, onChangeSellQuantity, onChangeBuyQuantity };

  return (
    <Context.Provider value={{ state: swapFormState, actions: allActions }}>
      {children}
    </Context.Provider>
  );
}

SwapFormProvider.propTypes = {
  children: PropTypes.node,
  value: PropTypes.object,
};
