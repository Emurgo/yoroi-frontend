// @flow
import type { RefObject, InputHTMLAttributes } from 'react';

export enum SwapFormActionType {
  SellTouched = 'sellTouched',
  BuyTouched = 'buyTouched',
  SwitchTouched = 'switchTouched',
  SwitchTokens = 'switchTokens',
  PoolTouched = 'poolTouched',
  PoolDefaulted = 'poolDefaulted',
  ClearSwapForm = 'clearSwapForm',
  ResetSwapForm = 'resetSwapForm',
  CanSwapChanged = 'canSwapChanged',
  BuyInputValueChanged = 'buyInputValueChanged',
  SellInputValueChanged = 'sellInputValueChanged',
  LimitPriceInputValueChanged = 'limitPriceInputValueChanged',
  SellAmountErrorChanged = 'sellAmountErrorChanged',
  BuyAmountErrorChanged = 'buyAmountErrorChanged',
}

export type SwapFormState = {
  sellQuantity: {|
    isTouched: boolean,
    disabled: boolean,
    error: string | undefined,
    displayValue: string,
  |},
  buyQuantity: {|
    isTouched: boolean,
    disabled: boolean,
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
};

export type SwapFormAction =
  | { type: SwapFormActionType.SellTouched }
  | { type: SwapFormActionType.BuyTouched }
  | { type: SwapFormActionType.SwitchTouched }
  | { type: SwapFormActionType.PoolTouched }
  | { type: SwapFormActionType.PoolDefaulted }
  | { type: SwapFormActionType.ClearSwapForm }
  | { type: SwapFormActionType.ResetSwapForm }
  | { type: SwapFormActionType.CanSwapChanged, canSwap: boolean }
  | { type: SwapFormActionType.SellInputValueChanged, value: string }
  | { type: SwapFormActionType.BuyInputValueChanged, value: string }
  | { type: SwapFormActionType.SellAmountErrorChanged, error: string | undefined }
  | { type: SwapFormActionType.LimitPriceInputValueChanged, value: string }
  | { type: SwapFormActionType.BuyAmountErrorChanged, error: string | undefined };

export type SwapFormActions = {
  sellTouched: () => void,
  buyTouched: () => void,
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
  buyAmountErrorChanged: (error: string | undefined) => void,
  sellAmountErrorChanged: (error: string | undefined) => void,
};

export type SwapFormContext = {|
  ...SwapFormState,
  ...SwapFormActions,
  sellInputRef: RefObject<InputHTMLAttributes> | undefined,
  buyInputRef: RefObject<InputHTMLAttributes> | undefined,
  limitInputRef: RefObject<InputHTMLAttributes> | undefined,
  onChangeSellQuantity: (text: string) => void,
  onChangeBuyQuantity: (text: string) => void,
  onChangeLimitPrice: (text: string) => void,
|};
