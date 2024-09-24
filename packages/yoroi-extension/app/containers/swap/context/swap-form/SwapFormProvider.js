//@flow
import { useSwap } from '@yoroi/swap';
import type { Node } from 'react';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { PRICE_PRECISION } from '../../../../components/swap/common';
import type { AssetAmount } from '../../../../components/swap/types';
import SwapStore from '../../../../stores/ada/SwapStore';
import { Quantities } from '../../../../utils/quantities';
import Context from './context';
import { defaultSwapFormState } from './DefaultSwapFormState';
import type { SwapFormAction, SwapFormState } from './types';
import { StateWrap, SwapFormActionTypeValues } from './types';
// const PRECISION = 14;

type Props = {|
  swapStore: SwapStore,
  children: any,
|};

const numberLocale = { decimalSeparator: '.' };

export default function SwapFormProvider({ swapStore, children }: Props): Node {
  const {
    pools,
    orderData,
    resetState,
    buyQuantityChanged,
    sellQuantityChanged,
    sellTokenInfoChanged,
    switchTokens,
    resetQuantities,
    limitPriceChanged,
    poolPairsChanged,
  } = useSwap();

  const { quantity: sellQuantity, tokenId: sellTokenId } = orderData.amounts.sell;
  const { quantity: buyQuantity, tokenId: buyTokenId } = orderData.amounts.buy;
  const { priceDenomination } = orderData.tokens;

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
  });

  const {
    sellTokenInfo: { ticker: sellTicker },
    buyTokenInfo: { ticker: buyTicker },
  } = swapFormState;

  const actions = {
    sellTouched: (token?: AssetAmount) => dispatch({ type: SwapFormActionTypeValues.SellTouched, token }),
    buyTouched: (token?: AssetAmount) => dispatch({ type: SwapFormActionTypeValues.BuyTouched, token }),
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
      clearErrors();
      resetState();
      dispatch({ type: SwapFormActionTypeValues.ResetSwapForm });
    },
    canSwapChanged: (canSwap: boolean) => dispatch({ type: SwapFormActionTypeValues.CanSwapChanged, canSwap }),
    buyInputValueChanged: (value: string) => dispatch({ type: SwapFormActionTypeValues.BuyInputValueChanged, value }),
    sellInputValueChanged: (value: string) => dispatch({ type: SwapFormActionTypeValues.SellInputValueChanged, value }),
    limitPriceInputValueChanged: (value: string) =>
      dispatch({ type: SwapFormActionTypeValues.LimitPriceInputValueChanged, value }),
    buyAmountErrorChanged: (error: string | null) => dispatch({ type: SwapFormActionTypeValues.BuyAmountErrorChanged, error }),
    sellAmountErrorChanged: (error: string | null) => dispatch({ type: SwapFormActionTypeValues.SellAmountErrorChanged, error }),
  };

  /**
   * On mount
   */
  useEffect(() => actions.resetSwapForm(), []);
  /**
   * On unmount
   */
  useEffect(() => () => actions.resetSwapForm(), []);

  /**
   * On sell asset changes - set default asset in case none is selected
   */
  useEffect(() => {
    if (sellTokenId === '' && sellTicker == null) {
      // SELECT DEFAULT SELL
      const assets = swapStore.assets;
      const defaultAsset = assets[0];
      if (defaultAsset != null) {
        actions.sellTouched({ ...defaultAsset });
        sellTokenInfoChanged({
          id: defaultAsset.id,
          decimals: defaultAsset.decimals,
        });
      }
    }
  }, [sellTokenId, sellTicker]);

  /**
   * On token pair changes - fetch pools for pair
   */
  useEffect(() => {
    if (sellTokenId != null && buyTokenId != null && sellTokenId !== buyTokenId) {
      pools.list
        .byPair({ tokenA: sellTokenId, tokenB: buyTokenId })
        .then(poolsArray => poolPairsChanged(poolsArray))
        .catch(err => console.error(`Failed to fetch pools for pair: ${sellTokenId}/${buyTokenId}`, err));
    }
  }, [sellTokenId, buyTokenId, sellTicker, buyTicker]);

  const clearErrors = useCallback(() => {
    if (swapFormState.sellQuantity.error != null) actions.sellAmountErrorChanged(null);
    if (swapFormState.buyQuantity.error != null) actions.buyAmountErrorChanged(null);
  }, [actions, swapFormState.buyQuantity.error, swapFormState.sellQuantity.error]);

  const baseSwapFieldChangeHandler = (tokenInfo: any, handler: ({| input: string, quantity: string |}) => void) => (
    text: string = ''
  ) => {
    if (tokenInfo.tokenId === '') {
      // empty input
      return;
    }
    const decimals = tokenInfo.decimals ?? 0;
    const precision = tokenInfo.precision ?? decimals;
    const [input, quantity] = Quantities.parseFromText(text, decimals, numberLocale, precision);
    clearErrors();
    handler({ quantity, input: text === '' ? '' : input });
  };

  const sellUpdateHandler = ({ input, quantity }) => {
    if (quantity !== sellQuantity) {
      sellQuantityChanged(quantity);
    }
    actions.sellInputValueChanged(input);
    const sellAvailableAmount = swapFormState.sellTokenInfo.amount ?? '0';
    if (quantity !== '' && sellAvailableAmount !== '') {
      const decimals = swapFormState.sellTokenInfo.decimals ?? 0;
      const calculation = orderData.selectedPoolCalculation;

      const [, availableQuantity] = Quantities.parseFromText(sellAvailableAmount, decimals, numberLocale);
      const diff = Quantities.diff(availableQuantity, quantity);

      if (Quantities.isGreaterThan(quantity, availableQuantity)) {
        actions.sellAmountErrorChanged('Not enough balance');
        return;
      }
      if (calculation?.cost) {
        const totalFee = Quantities.sum([calculation.cost.batcherFee.quantity, calculation.cost.deposit.quantity]);

        if (Number(diff) < Number(totalFee)) {
          actions.sellAmountErrorChanged('Not enough balance, please consider the fees');
          return;
        }
      }
    }
  };

  const buyUpdateHandler = ({ input, quantity }) => {
    if (quantity !== buyQuantity) {
      buyQuantityChanged(quantity);
    }
    actions.buyInputValueChanged(input);
  };

  const limitUpdateHandler = ({ input, quantity }) => {
    if (quantity !== orderData.limitPrice) {
      limitPriceChanged(quantity);
    }
    actions.limitPriceInputValueChanged(input);
  };

  const onChangeSellQuantity = useCallback(baseSwapFieldChangeHandler(swapFormState.sellTokenInfo, sellUpdateHandler), [
    sellQuantityChanged,
    actions,
    clearErrors,
  ]);

  const onChangeBuyQuantity = useCallback(baseSwapFieldChangeHandler(swapFormState.buyTokenInfo, buyUpdateHandler), [
    buyQuantityChanged,
    actions,
    clearErrors,
  ]);

  const onChangeLimitPrice = useCallback(
    baseSwapFieldChangeHandler(
      { tokenId: 'priceDenomination', decimals: priceDenomination, precision: PRICE_PRECISION },
      limitUpdateHandler
    ),
    [limitPriceChanged, actions, clearErrors, priceDenomination]
  );

  const sellFocusState = StateWrap<boolean>(useState(false));
  const buyFocusState = StateWrap<boolean>(useState(false));
  const limitPriceFocusState = StateWrap<boolean>(useState(false));

  /**
   * On sell quantity changes
   */
  useEffect(() => {
    if (swapFormState.sellQuantity.isTouched && !sellFocusState.value) {
      const decimals = swapFormState.sellTokenInfo.decimals ?? 0;
      const formatted = Quantities.format(sellQuantity, decimals);
      sellUpdateHandler({ input: formatted, quantity: sellQuantity });
    }
  }, [sellQuantity, swapFormState.sellTokenInfo.decimals, swapFormState.sellQuantity.isTouched]);

  /**
   * On buy quantity changes
   */
  useEffect(() => {
    if (swapFormState.buyQuantity.isTouched && !buyFocusState.value) {
      const decimals = swapFormState.buyTokenInfo.decimals ?? 0;
      const formatted = Quantities.format(buyQuantity, decimals);
      buyUpdateHandler({ input: formatted, quantity: buyQuantity });
    }
  }, [buyQuantity, swapFormState.buyTokenInfo.decimals, swapFormState.buyQuantity.isTouched]);

  /**
   * Limit price updater
   */
  useEffect(() => {
    const isLimit = orderData.type === 'limit';
    if (isLimit && limitPriceFocusState.value) return;
    const quantity = (isLimit ? orderData.limitPrice : orderData.selectedPoolCalculation?.prices.market) ?? Quantities.zero;
    const formatted = Quantities.format(quantity, priceDenomination, PRICE_PRECISION);
    limitUpdateHandler({ input: formatted, quantity: orderData.limitPrice });
  }, [
    priceDenomination,
    orderData.limitPrice,
    orderData.selectedPoolCalculation?.prices.market,
    orderData.selectedPoolCalculation?.pool.poolId,
    orderData.type,
  ]);

  const allActions = {
    ...actions,
    sellFocusState,
    buyFocusState,
    limitPriceFocusState,
    onChangeSellQuantity,
    onChangeBuyQuantity,
    onChangeLimitPrice,
  };

  return <Context.Provider value={{ state: swapFormState, actions: allActions }}>{children}</Context.Provider>;
}
