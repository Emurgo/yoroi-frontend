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
    tokenInfo: {},
  },
  buyQuantity: {
    isTouched: false,
    disabled: false,
    error: undefined,
    displayValue: '',
    tokenInfo: {},
  },
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
    const draft = Object.assign({}, state);
    console.log('🚀 > draft:', draft);

    switch (action.type) {
      case SwapFormActionTypeValues.ResetSwapForm:
        return Object.assign({}, defaultSwapFormState);
      case SwapFormActionTypeValues.ClearSwapForm:
        return Object.assign({}, state);
      case SwapFormActionTypeValues.SellTouched:
        draft.sellQuantity.isTouched = true;
        draft.sellQuantity.displayValue = '';
        draft.sellQuantity.error = undefined;
        draft.sellQuantity.tokenInfo = action.token;

        break;
      case SwapFormActionTypeValues.BuyTouched:
        draft.buyQuantity.isTouched = true;
        draft.buyQuantity.displayValue = '';
        draft.buyQuantity.error = undefined;
        draft.buyQuantity.tokenInfo = action.token;
        break;
      case SwapFormActionTypeValues.SwitchTouched:
        draft.sellQuantity.isTouched = state.buyQuantity.isTouched;
        draft.buyQuantity.isTouched = state.sellQuantity.isTouched;
        draft.sellQuantity.displayValue = state.buyQuantity.displayValue;
        draft.buyQuantity.displayValue = state.sellQuantity.displayValue;
        draft.buyQuantity.tokenInfo = state.sellQuantity.tokenInfo;
        draft.sellQuantity.tokenInfo = state.buyQuantity.tokenInfo;
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

    console.log('🚀 > draft 2:', draft);
    return draft;
  };

  const [swapFormState, dispatch] = useReducer(swapFormReducer, {
    ...defaultSwapFormState,
    ...initialSwapFormProvider,
  });

  const actions = useMemo(
    () => ({
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
        console.log('🚀 > resetQuantities');
        dispatch({ type: SwapFormActionTypeValues.ClearSwapForm });
      },
      resetSwapForm: () => {
        resetState();
        console.log('🚀 > resetState');
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
    }),
    []
  );

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
