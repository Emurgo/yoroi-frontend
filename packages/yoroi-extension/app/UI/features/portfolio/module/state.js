// @flow
import { invalid } from '@yoroi/common';
import { produce } from 'immer';

type currency = 'ADA' | 'USD' | 'BRL' | 'ETH' | 'BTC' | 'KRW' | 'CNY' | 'EUR' | 'JPY';

// Define types
export type PortfolioActions = {|
  +unitOfAccountChanged: (currency: currency) => void,
|};

export const PortfolioActionType = Object.freeze({
  UnitOfAccountChanged: 'unitOfAccountChanged',
});

export type PortfolioAction = {|
  type: typeof PortfolioActionType.UnitOfAccountChanged,
  unitOfAccount: currency,
|};

// Define state type
export type PortfolioState = {|
  unitOfAccount: currency,
|};

// Define default state
export const defaultPortfolioState: PortfolioState = {};

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
