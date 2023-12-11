//@flow
import { useCallback, useState } from 'react';
import { defaultFromAsset, defaultToAsset, poolList } from './mockData';

type SwapFormState = {|
  sellQuantity: {|
    error: string | undefined,
    displayValue: string,
  |},
  buyQuantity: {|
    error: string | undefined,
    displayValue: string,
  |},
  selectedPool: {|
    isTouched: boolean,
  |},
  limitPrice: {|
    displayValue: string,
  |},
  canSwap: boolean,
|};

const defaultState: SwapFormState = Object.freeze({
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
  selectedPool: {
    isTouched: false,
  },
  limitPrice: {
    displayValue: '',
  },
  canSwap: false,
});

export default function useSwapForm(): object {
  const [formState, setFormState] = useState<SwapFormState>(defaultState);
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [pool, setPool] = useState(poolList[0]);
  const [slippage, setSlippage] = useState('1');

  const onChangeSellQuantity = useCallback(
    (text: string) => {
      sellQuantityChanged(quantity);
      actions.sellInputValueChanged(text === '' ? '' : input);

      clearErrors();
    },
    [actions, clearErrors, sellQuantityChanged, sellTokenInfo.decimals]
  );

  return {
    isMarketOrder,
    pool,
    slippage,
    setIsMarketOrder,
    setPool,
    setSlippage,
    setFromAsset,
    setToAsset,
    formState,
  };
}
