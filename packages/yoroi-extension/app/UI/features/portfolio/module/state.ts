import { produce } from 'immer';
import { WalletBalance } from '../../../types/currrentWallet';

export type CurrencyType = 'ADA' | 'USD' | 'BRL' | 'ETH' | 'BTC' | 'KRW' | 'CNY' | 'EUR' | 'JPY' | 'none' | null;
export type AccountPair = {
  from: { name: string; value: string };
  to: { name: string; value: string };
} | null;

// Define types
export type PortfolioActions = {
  changeUnitOfAccount: (currency: CurrencyType) => void;
  changeUnitOfAccountPair: (payload: AccountPair) => void;
};

export const PortfolioActionType = Object.freeze({
  changeUnitOfAccount: 'changeUnitOfAccount',
  changeUnitOfAccountPair: 'changeUnitOfAccountPair',
});

export type PortfolioAction =
  | {
      type: typeof PortfolioActionType.changeUnitOfAccount;
      unitOfAccount: CurrencyType;
    }
  | {
      type: typeof PortfolioActionType.changeUnitOfAccountPair;
      accountPair: AccountPair;
    };

// Define state type
export type PortfolioState = {
  unitOfAccount: CurrencyType;
  settingFiatPairUnit: {
    currency: CurrencyType;
    enabled: boolean;
  };
  accountPair: AccountPair | null;
  walletBalance: WalletBalance | null;
  networkId: number | null;
  assetList: any[];
};

// Define default state
export const defaultPortfolioState: PortfolioState = {
  unitOfAccount: 'ADA',
  settingFiatPairUnit: {
    currency: null,
    enabled: false,
  },
  accountPair: null,
  walletBalance: null,
  networkId: null,
  assetList: [],
};

// Define action handlers
export const defaultPortfolioActions: PortfolioActions = {
  changeUnitOfAccount: () => console.log('missing init changeUnitOfAccount'),
  changeUnitOfAccountPair: () => console.log('missing init changeUnitOfAccount'),
};

// Reducer function
export const PortfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  return produce(state, draft => {
    switch (action.type) {
      case PortfolioActionType.changeUnitOfAccount:
        draft.unitOfAccount = action.unitOfAccount;
        break;
      case PortfolioActionType.changeUnitOfAccountPair:
        draft.accountPair = action.accountPair;
        break;
      default:
        return;
    }
  });
};
