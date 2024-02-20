//@flow
import type { Node } from 'react';
import type { SwapFormState, SwapFormAction } from './types';
import type { AssetAmount } from '../../../../components/swap/types';
import { SwapFormActionTypeValues } from './types';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSwap } from '@yoroi/swap';
// import { Quantities } from '../../../../utils/quantities';
import Context from './context';
import { Quantities } from '../../../../utils/quantities';

// const PRECISION = 14;

export const defaultSwapFormState: SwapFormState = Object.freeze({
  sellQuantity: {
    isTouched: true,
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
  buyTokenInfo: {},
  selectedPool: { isTouched: false },
  limitPrice: { displayValue: '' },
  canSwap: false,
});

type Props = {|
  initialSwapFormProvider?: SwapFormState,
  children: any,
|};

const numberLocale = { decimalSeparator: ',' };

export default function SwapFormProvider({ initialSwapFormProvider, children }: Props): Node {
  const {
    orderData,
    resetState,
    buyQuantityChanged,
    sellQuantityChanged,
    switchTokens,
    // limitPriceChanged,
    resetQuantities,
  } = useSwap();

  const { quantity: buyQuantity } = orderData.amounts.buy;
  const { quantity: sellQuantity } = orderData.amounts.sell;

  // TODO: fix the types for TextInput
  const buyInputRef = useRef/*<TextInput | null>*/(null);
  const sellInputRef = useRef/*<TextInput | null>*/(null);
  // const limitInputRef = useRef<TextInput | null>(null)

  const swapFormReducer = (state: SwapFormState, action: SwapFormAction) => {
    const draft = { ...state };

    switch (action.type) {
      case SwapFormActionTypeValues.ResetSwapForm:
        return { ...defaultSwapFormState };
      case SwapFormActionTypeValues.ClearSwapForm:
        return { ...state };
      case SwapFormActionTypeValues.SellTouched:
        draft.sellQuantity.isTouched = true;
        draft.sellQuantity.displayValue = '';
        draft.sellQuantity.error = null;
        draft.sellTokenInfo = action.token;
        break;
      case SwapFormActionTypeValues.BuyTouched:
        draft.buyQuantity.isTouched = true;
        draft.buyQuantity.displayValue = '';
        draft.buyQuantity.error = null;
        draft.buyTokenInfo = action.token;
        break;
      case SwapFormActionTypeValues.SwitchTouched:
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched;
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched;
        draft.sellQuantity.displayValue = state.buyQuantity.displayValue;
        draft.buyQuantity.displayValue = state.sellQuantity.displayValue;
        draft.buyTokenInfo = { ...state.sellTokenInfo };
        draft.sellTokenInfo = { ...state.buyTokenInfo };
        draft.sellQuantity.error = null;
        draft.buyQuantity.error = null;
        break;
      case SwapFormActionTypeValues.PoolTouched:
        draft.selectedPool.isTouched = true;
        break;
      case SwapFormActionTypeValues.PoolDefaulted:
        draft.selectedPool = defaultSwapFormState.selectedPool;
        break;
      case SwapFormActionTypeValues.CanSwapChanged:
        draft.canSwap = action.canSwap ?? false;
        break;
      case SwapFormActionTypeValues.SellInputValueChanged:
        draft.sellQuantity.displayValue = (state.sellQuantity.isTouched && action.value) || '';
        break;
      case SwapFormActionTypeValues.BuyInputValueChanged:
        draft.buyQuantity.displayValue = (state.buyQuantity.isTouched && action.value) || '';
        break;
      case SwapFormActionTypeValues.LimitPriceInputValueChanged:
        draft.limitPrice.displayValue = action.value || '';
        break;
      case SwapFormActionTypeValues.SellAmountErrorChanged:
        draft.sellQuantity.error = action.error || null;
        break;
      case SwapFormActionTypeValues.BuyAmountErrorChanged:
        draft.buyQuantity.error = action.error || null;
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
    buyAmountErrorChanged: (error: string | null) =>
      dispatch({ type: SwapFormActionTypeValues.BuyAmountErrorChanged, error }),
    sellAmountErrorChanged: (error: string | null) =>
      dispatch({ type: SwapFormActionTypeValues.SellAmountErrorChanged, error }),
  };

  const clearErrors = useCallback(() => {
    if (swapFormState.sellQuantity.error !== undefined) actions.sellAmountErrorChanged(null);
    if (swapFormState.buyQuantity.error !== undefined) actions.buyAmountErrorChanged(null);
  }, [actions, swapFormState.buyQuantity.error, swapFormState.sellQuantity.error]);

  const onChangeSellQuantity = useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(
        text,
        swapFormState.sellTokenInfo.decimals ?? 0,
        numberLocale
      );
      sellQuantityChanged(quantity);
      actions.sellInputValueChanged(text === '' ? '' : input);

      clearErrors();
    },
    [actions, clearErrors, sellQuantityChanged]
  );

  const onChangeBuyQuantity = useCallback(
    (text: string) => {
      const [input, quantity] = Quantities.parseFromText(
        text,
        swapFormState.buyTokenInfo.decimals ?? 0,
        numberLocale
      );
      buyQuantityChanged(quantity);
      actions.buyInputValueChanged(text === '' ? '' : input);

      clearErrors();
    },
    [buyQuantityChanged, actions, clearErrors]
  );

  const updateSellInput = useCallback(() => {
    if (swapFormState.sellQuantity.isTouched && !sellInputRef?.current?.isFocused()) {
      actions.sellInputValueChanged(
        Quantities.format(sellQuantity, swapFormState.sellTokenInfo.decimals ?? 0)
      );
    }
  }, [sellQuantity, swapFormState.sellTokenInfo.decimals, swapFormState.sellQuantity.isTouched]);

  const updateBuyInput = useCallback(() => {
    if (swapFormState.buyQuantity.isTouched && !buyInputRef?.current?.isFocused()) {
      actions.buyInputValueChanged(
        Quantities.format(buyQuantity, swapFormState.buyTokenInfo.decimals ?? 0)
      );
    }
  }, [swapFormState.buyTokenInfo.decimals, buyQuantity, swapFormState.buyQuantity.isTouched]);

  useEffect(() => {
    updateSellInput();
  }, [sellQuantity, updateSellInput]);

  useEffect(() => {
    updateBuyInput();
  }, [buyQuantity, updateBuyInput]);

  const allActions = {
    ...actions,
    buyInputRef,
    sellInputRef,
    onChangeSellQuantity,
    onChangeBuyQuantity,
  };

  return (
    <Context.Provider value={{ state: swapFormState, actions: allActions }}>
      {children}
    </Context.Provider>
  );
}
