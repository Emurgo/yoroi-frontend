// @flow
import type { AssetAmount } from '../../../../components/swap/types';
import { noop } from '../../../../coreUtils';

export const SwapFormActionTypeValues = Object.freeze({
  SellTouched: 'sellTouched',
  BuyTouched: 'buyTouched',
  SwitchTouched: 'switchTouched',
  SwitchTokens: 'switchTokens',
  PoolTouched: 'poolTouched',
  PoolDefaulted: 'poolDefaulted',
  ClearSwapForm: 'clearSwapForm',
  ResetSwapForm: 'resetSwapForm',
  CanSwapChanged: 'canSwapChanged',
  BuyInputValueChanged: 'buyInputValueChanged',
  SellInputValueChanged: 'sellInputValueChanged',
  LimitPriceInputValueChanged: 'limitPriceInputValueChanged',
  SellAmountErrorChanged: 'sellAmountErrorChanged',
  BuyAmountErrorChanged: 'buyAmountErrorChanged',
});

export type SwapFormActionType = $Values<typeof SwapFormActionTypeValues>;

export type SwapFormState = {|
  sellTokenInfo: Object,
  sellQuantity: {|
    isTouched: boolean,
    disabled: boolean,
    error: string | null,
    displayValue: string,
  |},
  buyTokenInfo: Object,
  buyQuantity: {|
    isTouched: boolean,
    disabled: boolean,
    error: string | null,
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

export type SwapFormAction = {|
  type: SwapFormActionType,
  token?: AssetAmount,
  canSwap?: boolean,
  value?: string,
  error?: string | null,
|};

export type SwapFormActions = {|
  sellTouched: (token?: AssetAmount) => void,
  buyTouched: (token?: AssetAmount) => void,
  switchTouched: () => void,
  switchTokens: () => void,
  poolTouched: () => void,
  poolDefaulted: () => void,
  clearSwapForm: () => void,
  resetSwapForm: () => void,
  canSwapChanged: (canSwap: boolean) => void,
  buyInputValueChanged: (value: string) => void,
  sellInputValueChanged: (value: string) => void,
  limitPriceInputValueChanged: (value: string) => void,
  buyAmountErrorChanged: (error: string | null) => void,
  sellAmountErrorChanged: (error: string | null) => void,
|};

export type State<S> = {| value: S, update: ((S => S) | S) => void |}

export function StateWrap<S>([value, update]: [S, ((S => S) | S) => void]): State<S> {
  return { value, update };
}

export function ConstantState<S>(s: S): State<S> {
  return { value: s, update: noop };
}

export type SwapFormContext = {|
  ...SwapFormState,
  ...SwapFormActions,
  sellFocusState: State<boolean>,
  buyFocusState: State<boolean>,
  limitPriceFocusState: State<boolean>,
  onChangeSellQuantity: (text: string) => void,
  onChangeBuyQuantity: (text: string) => void,
  onChangeLimitPrice: (text: string) => void,
|};
