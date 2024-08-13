import { produce } from 'immer';

export type CurrencyType = 'ADA' | 'USD' | 'BRL' | 'ETH' | 'BTC' | 'KRW' | 'CNY' | 'EUR' | 'JPY' | null;

// Define types
export type PortfolioActions = {
  changeUnitOfAccount: (currency: CurrencyType) => void;
};

export const PortfolioActionType = Object.freeze({
  changeUnitOfAccount: 'changeUnitOfAccount',
});

export type PortfolioAction = {
  type: typeof PortfolioActionType.changeUnitOfAccount;
  unitOfAccount: CurrencyType;
};

// Define state type
export type PortfolioState = {
  unitOfAccount: CurrencyType;
  settingFiatPairUnit: {
    currency: CurrencyType;
    enabled: boolean;
  };
};

// Define default state
export const defaultPortfolioState: PortfolioState = {
  unitOfAccount: 'ADA',
  settingFiatPairUnit: {
    currency: null,
    enabled: false,
  },
};

// Define action handlers
export const defaultPortfolioActions: PortfolioActions = {
  changeUnitOfAccount: () => console.log('missing init changeUnitOfAccount'),
};

// Reducer function
export const PortfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  return produce(state, draft => {
    switch (action.type) {
      case PortfolioActionType.changeUnitOfAccount:
        draft.unitOfAccount = action.unitOfAccount;
        break;
      default:
        return;
    }
  });
};
