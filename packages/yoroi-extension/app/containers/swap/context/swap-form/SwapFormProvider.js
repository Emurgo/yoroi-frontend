// export const SwapFormProvider = ({
//   children,
//   initialState,
// }: {
//   children: ReactNode
//   initialState?: Partial<SwapFormState>
// }) => {

//   const buyInputRef = useRef<TextInput | null>(null)
//   const sellInputRef = useRef<TextInput | null>(null)
//   const limitInputRef = useRef<TextInput | null>(null)

//   const pool = orderData.selectedPoolCalculation?.pool
//   const {tokenId: buyTokenId, quantity: buyQuantity} = orderData.amounts.buy
//   const {tokenId: sellTokenId, quantity: sellQuantity} = orderData.amounts.sell

//   const buyTokenInfo = useTokenInfo({wallet, tokenId: buyTokenId})
//   const sellTokenInfo = useTokenInfo({wallet, tokenId: sellTokenId})

//   const balances = useBalances(wallet)
//   const sellbalance = Amounts.getAmount(balances, sellTokenId).quantity
//   const primaryTokenBalance = Amounts.getAmount(balances, wallet.primaryTokenInfo.id).quantity

//   const minReceived = orderData.selectedPoolCalculation?.buyAmountWithSlippage.quantity ?? Quantities.zero
//   const poolSupply = buyTokenId === pool?.tokenA.tokenId ? pool?.tokenA.quantity : pool?.tokenB.quantity
//   const hasBuyTokenSupply = !Quantities.isGreaterThan(buyQuantity, poolSupply ?? Quantities.zero)
//   const hasSellBalance = !Quantities.isGreaterThan(sellQuantity, sellbalance)
//   const hasPtBalance = !Quantities.isGreaterThan(
//     Quantities.sum([
//       sellTokenId === wallet.primaryTokenInfo.id ? sellQuantity : Quantities.zero,
//       orderData.selectedPoolCalculation?.cost.ptTotalRequired.quantity ?? Quantities.zero,
//     ]),
//     primaryTokenBalance,
//   )

//   const updateSellInput = useCallback(() => {
//     if (state.sellQuantity.isTouched && !sellInputRef?.current?.isFocused()) {
//       actions.sellInputValueChanged(Quantities.format(sellQuantity, sellTokenInfo.decimals ?? 0))
//     }
//   }, [actions, sellQuantity, sellTokenInfo.decimals, state.sellQuantity.isTouched])

//   const updateBuyInput = useCallback(() => {
//     if (state.buyQuantity.isTouched && !buyInputRef?.current?.isFocused()) {
//       actions.buyInputValueChanged(Quantities.format(buyQuantity, buyTokenInfo.decimals ?? 0))
//     }
//   }, [actions, buyTokenInfo.decimals, buyQuantity, state.buyQuantity.isTouched])

//   const updateLimitPrice = useCallback(() => {
//     if (orderData.type === 'limit' && !limitInputRef?.current?.isFocused()) {
//       actions.limitPriceInputValueChanged(
//         Quantities.format(orderData.limitPrice ?? Quantities.zero, orderData.tokens.priceDenomination, PRECISION),
//       )
//     } else if (orderData.type === 'market') {
//       actions.limitPriceInputValueChanged(
//         Quantities.format(
//           orderData.selectedPoolCalculation?.prices.market ?? Quantities.zero,
//           orderData.tokens.priceDenomination,
//           PRECISION,
//         ),
//       )
//     }
//   }, [
//     actions,
//     orderData.tokens.priceDenomination,
//     orderData.limitPrice,
//     orderData.selectedPoolCalculation?.prices.market,
//     orderData.type,
//   ])

//   const clearErrors = useCallback(() => {
//     if (state.sellQuantity.error !== undefined) actions.sellAmountErrorChanged(undefined)
//     if (state.buyQuantity.error !== undefined) actions.buyAmountErrorChanged(undefined)
//   }, [actions, state.buyQuantity.error, state.sellQuantity.error])

//   const onChangeSellQuantity = useCallback(
//     (text: string) => {
//       const [input, quantity] = Quantities.parseFromText(text, sellTokenInfo.decimals ?? 0, numberLocale)
//       sellQuantityChanged(quantity)
//       actions.sellInputValueChanged(text === '' ? '' : input)

//       clearErrors()
//     },
//     [actions, clearErrors, numberLocale, sellQuantityChanged, sellTokenInfo.decimals],
//   )

//   const onChangeBuyQuantity = useCallback(
//     (text: string) => {
//       const [input, quantity] = Quantities.parseFromText(text, buyTokenInfo.decimals ?? 0, numberLocale)
//       buyQuantityChanged(quantity)
//       actions.buyInputValueChanged(text === '' ? '' : input)

//       clearErrors()
//     },
//     [buyTokenInfo.decimals, numberLocale, buyQuantityChanged, actions, clearErrors],
//   )

//   const onChangeLimitPrice = useCallback(
//     (text: string) => {
//       const [formattedPrice, price] = Quantities.parseFromText(
//         text,
//         orderData.tokens.priceDenomination,
//         numberLocale,
//         PRECISION,
//       )
//       actions.limitPriceInputValueChanged(formattedPrice)
//       limitPriceChanged(price)

//       clearErrors()
//     },
//     [actions, clearErrors, orderData.tokens.priceDenomination, limitPriceChanged, numberLocale],
//   )

//   // buy input errors
//   useEffect(() => {
//     // not enough pool error
//     if (orderData.pools.length === 0 && state.buyQuantity.isTouched && state.sellQuantity.isTouched) {
//       actions.buyAmountErrorChanged(strings.noPool)
//       return
//     }

//     if (
//       orderData.selectedPoolCalculation !== undefined &&
//       state.buyQuantity.isTouched &&
//       state.sellQuantity.isTouched &&
//       state.buyQuantity.error === strings.noPool
//     ) {
//       actions.buyAmountErrorChanged(undefined)
//       return
//     }

//     // not enough supply error
//     if (
//       state.sellQuantity.isTouched &&
//       state.buyQuantity.isTouched &&
//       (pool === undefined || (!Quantities.isZero(buyQuantity) && !hasBuyTokenSupply))
//     ) {
//       actions.buyAmountErrorChanged(strings.notEnoughSupply)
//       return
//     }

//     if (
//       state.sellQuantity.isTouched &&
//       state.buyQuantity.isTouched &&
//       pool !== undefined &&
//       !Quantities.isZero(buyQuantity) &&
//       hasBuyTokenSupply &&
//       state.buyQuantity.error === strings.notEnoughSupply
//     ) {
//       actions.buyAmountErrorChanged(undefined)
//       return
//     }
//   }, [
//     actions,
//     buyQuantity,
//     hasBuyTokenSupply,
//     pool,
//     state.buyQuantity.isTouched,
//     state.sellQuantity.isTouched,
//     strings.notEnoughSupply,
//     orderData.selectedPoolCalculation,
//     strings.noPool,
//     state.buyQuantity.error,
//     orderData.pools.length,
//   ])

//   // sell input errors
//   useEffect(() => {
//     // no pool error
//     if (
//       orderData.selectedPoolCalculation === undefined &&
//       state.buyQuantity.isTouched &&
//       state.sellQuantity.isTouched
//     ) {
//       actions.sellAmountErrorChanged(strings.noPool)
//       return
//     }

//     if (
//       orderData.selectedPoolCalculation !== undefined &&
//       state.buyQuantity.isTouched &&
//       state.sellQuantity.isTouched &&
//       state.sellQuantity.error === strings.noPool
//     ) {
//       actions.sellAmountErrorChanged(undefined)
//       return
//     }

//     // no enough balance error
//     if (!Quantities.isZero(sellQuantity) && !hasSellBalance) {
//       actions.sellAmountErrorChanged(strings.notEnoughBalance)
//       return
//     }

//     // no enough fee balance error
//     if (!Quantities.isZero(sellQuantity) && state.buyQuantity.isTouched && !hasPtBalance) {
//       actions.sellAmountErrorChanged(strings.notEnoughFeeBalance)
//       return
//     }

//     // min received 0 error
//     if (
//       state.sellQuantity.isTouched &&
//       state.buyQuantity.isTouched &&
//       !Quantities.isZero(buyQuantity) &&
//       Quantities.isZero(minReceived)
//     ) {
//       actions.sellAmountErrorChanged(strings.slippageWarningChangeAmount)
//       return
//     }

//     if (
//       state.sellQuantity.isTouched &&
//       state.buyQuantity.isTouched &&
//       !Quantities.isZero(buyQuantity) &&
//       !Quantities.isZero(minReceived) &&
//       state.sellQuantity.error === strings.slippageWarningChangeAmount
//     ) {
//       actions.sellAmountErrorChanged(undefined)
//       return
//     }
//   }, [
//     actions,
//     buyQuantity,
//     hasPtBalance,
//     hasSellBalance,
//     minReceived,
//     orderData.selectedPoolCalculation,
//     sellQuantity,
//     state.buyQuantity.isTouched,
//     state.sellQuantity.error,
//     state.sellQuantity.isTouched,
//     strings.noPool,
//     strings.notEnoughBalance,
//     strings.notEnoughFeeBalance,
//     strings.slippageWarningChangeAmount,
//   ])

//   // can swap?
//   useEffect(() => {
//     const canSwap =
//       state.buyQuantity.isTouched &&
//       state.sellQuantity.isTouched &&
//       !Quantities.isZero(buyQuantity) &&
//       !Quantities.isZero(sellQuantity) &&
//       state.buyQuantity.error === undefined &&
//       state.sellQuantity.error === undefined &&
//       orderData.selectedPoolCalculation !== undefined &&
//       (orderData.type === 'market' ||
//         (orderData.type === 'limit' && orderData.limitPrice !== undefined && !Quantities.isZero(orderData.limitPrice)))

//     actions.canSwapChanged(canSwap)
//   }, [
//     actions,
//     buyQuantity,
//     orderData.limitPrice,
//     orderData.selectedPoolCalculation,
//     orderData.type,
//     sellQuantity,
//     state.buyQuantity.error,
//     state.buyQuantity.isTouched,
//     state.canSwap,
//     state.sellQuantity.error,
//     state.sellQuantity.isTouched,
//   ])

//   useEffect(() => {
//     updateSellInput()
//   }, [sellQuantity, updateSellInput])

//   useEffect(() => {
//     updateBuyInput()
//   }, [buyQuantity, updateBuyInput])

//   useEffect(() => {
//     updateLimitPrice()
//   }, [orderData.limitPrice, orderData.selectedPoolCalculation?.prices.market, orderData.type, updateLimitPrice])

//   const context = useMemo(
//     () => ({
//       ...state,
//       buyInputRef,
//       sellInputRef,
//       limitInputRef,
//       onChangeSellQuantity,
//       onChangeBuyQuantity,
//       onChangeLimitPrice,
//       ...actions,
//     }),
//     [state, onChangeSellQuantity, onChangeBuyQuantity, onChangeLimitPrice, actions],
//   )

//   return <SwapFormContext.Provider value={context}>{children}</SwapFormContext.Provider>
// }

import type { SwapFormState, SwapFormActionType, SwapFormAction } from './types';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSwap } from '@yoroi/swap';
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
  selectedPool: { isTouched: false },
  limitPrice: { displayValue: '' },
  canSwap: false,
});

export default function SwapFormProvider({ initialSwapFormProvider, children }) {
  const [swapFormState, setState] = useState();

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
    const draft = Object.assign({}, state);

    switch (action.type) {
      case SwapFormActionType.ResetSwapForm:
        return defaultState;
      case SwapFormActionType.ClearSwapForm:
        return state;
      case SwapFormActionType.SellTouched:
        draft.sellQuantity.isTouched = true;
        draft.sellQuantity.displayValue = '';
        draft.sellQuantity.error = undefined;
        break;
      case SwapFormActionType.BuyTouched:
        draft.buyQuantity.isTouched = true;
        draft.buyQuantity.displayValue = '';
        draft.buyQuantity.error = undefined;
        break;
      case SwapFormActionType.SwitchTouched:
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched;
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched;
        draft.sellQuantity.displayValue = state.buyQuantity.displayValue;
        draft.buyQuantity.displayValue = state.sellQuantity.displayValue;
        draft.sellQuantity.error = undefined;
        draft.buyQuantity.error = undefined;
        break;
      case SwapFormActionType.PoolTouched:
        draft.selectedPool.isTouched = true;
        break;
      case SwapFormActionType.PoolDefaulted:
        draft.selectedPool = defaultState.selectedPool;
        break;
      case SwapFormActionType.CanSwapChanged:
        draft.canSwap = action.canSwap;
        break;
      case SwapFormActionType.SellInputValueChanged:
        if (state.sellQuantity.isTouched) draft.sellQuantity.displayValue = action.value;
        break;
      case SwapFormActionType.BuyInputValueChanged:
        if (state.buyQuantity.isTouched) draft.buyQuantity.displayValue = action.value;
        break;
      case SwapFormActionType.LimitPriceInputValueChanged:
        draft.limitPrice.displayValue = action.value;
        break;
      case SwapFormActionType.SellAmountErrorChanged:
        draft.sellQuantity.error = action.error;
        break;
      case SwapFormActionType.BuyAmountErrorChanged:
        draft.buyQuantity.error = action.error;
        break;
      default:
        throw new Error(`swapFormReducer invalid action`);
    }

    return draft;
  };

  const [state, dispatch] = useReducer(swapFormReducer, {
    ...defaultSwapFormState,
    ...initialSwapFormProvider,
  });

  const actions = useMemo(
    () => ({
      sellTouched: () => dispatch({ type: SwapFormActionType.SellTouched }),
      buyTouched: () => dispatch({ type: SwapFormActionType.BuyTouched }),
      switchTouched: () => dispatch({ type: SwapFormActionType.SwitchTouched }),
      switchTokens: () => {
        switchTokens();
        dispatch({ type: SwapFormActionType.SwitchTouched });
      },
      poolTouched: () => dispatch({ type: SwapFormActionType.PoolTouched }),
      poolDefaulted: () => dispatch({ type: SwapFormActionType.PoolDefaulted }),
      clearSwapForm: () => {
        resetQuantities();
        dispatch({ type: SwapFormActionType.ClearSwapForm });
      },
      resetSwapForm: () => {
        resetState();
        dispatch({ type: SwapFormActionType.ResetSwapForm });
      },
      canSwapChanged: (canSwap: boolean) =>
        dispatch({ type: SwapFormActionType.CanSwapChanged, canSwap }),
      buyInputValueChanged: (value: string) =>
        dispatch({ type: SwapFormActionType.BuyInputValueChanged, value }),
      sellInputValueChanged: (value: string) =>
        dispatch({ type: SwapFormActionType.SellInputValueChanged, value }),
      limitPriceInputValueChanged: (value: string) =>
        dispatch({ type: SwapFormActionType.LimitPriceInputValueChanged, value }),
      buyAmountErrorChanged: (error: string | undefined) =>
        dispatch({ type: SwapFormActionType.BuyAmountErrorChanged, error }),
      sellAmountErrorChanged: (error: string | undefined) =>
        dispatch({ type: SwapFormActionType.SellAmountErrorChanged, error }),
    }),
    []
  );

  return <Context.Provider value={{ state: swapFormState, actions }}>{children}</Context.Provider>;
}

SwapFormProvider.propTypes = {
  children: PropTypes.node,
  value: PropTypes.object,
};
