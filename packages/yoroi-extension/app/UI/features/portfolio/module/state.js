// @flow
import { invalid } from '@yoroi/common';
import { produce } from 'immer';

export type CurrencyType = 'ADA' | 'USD' | 'BRL' | 'ETH' | 'BTC' | 'KRW' | 'CNY' | 'EUR' | 'JPY';

// Define types
export type PortfolioActions = {|
  +unitOfAccountChanged: (currency: CurrencyType) => void,
|};

export const PortfolioActionType = Object.freeze({
  UnitOfAccountChanged: 'unitOfAccountChanged',
});

export type PortfolioAction = {|
  type: typeof PortfolioActionType.UnitOfAccountChanged,
  unitOfAccount: CurrencyType,
|};

// Define state type
export type PortfolioState = {|
  unitOfAccount: CurrencyType,
|};

// Define default state
export const defaultPortfolioState: PortfolioState = {
  unitOfAccount: 'ADA',
};

// Define action handlers
export const defaultPortfolioActions: PortfolioActions = {
  unitOfAccountChanged: () => invalid('missing init unitOfAccountChanged'),
};

// Reducer function
export const PortfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  return produce(state, draft => {
    switch (action.type) {
      case PortfolioActionType.UnitOfAccountChanged:
        draft.unitOfAccount = action.unitOfAccount;
        break;
      default:
        return;
    }
  });
};
