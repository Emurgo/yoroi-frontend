import { produce } from 'immer';
import { WalletBalance } from '../../../types/currrentWallet';

export type CurrencyType = 'ADA' | 'USD' | 'BRL' | 'ETH' | 'BTC' | 'KRW' | 'CNY' | 'EUR' | 'JPY' | 'none' | null;
export type AccountPair = {
  from: { name: string; value: string };
  to: { name: string; value: string };
} | null;

// Define types
export type DappCenterActions = {
};

export const DappCenterActionType = Object.freeze({
  changeUnitOfAccount: 'changeUnitOfAccount',
  changeUnitOfAccountPair: 'changeUnitOfAccountPair',
});

export type DappCenterAction =
  | {
    type: typeof DappCenterActionType.changeUnitOfAccount;
    unitOfAccount: CurrencyType;
  }
  | {
    type: typeof DappCenterActionType.changeUnitOfAccountPair;
    accountPair: AccountPair;
  };

// Define state type
export type DappCenterState = {
  networkId: number | null;
  openBuyDialog: () => void;
};

// Define default state
export const defaultDappCenterState: DappCenterState = {
  networkId: null,
  openBuyDialog: () => { },
};

// Define action handlers
export const defaultDappCenterActions: DappCenterActions = {
};

// Reducer function
export const DappCenterReducer = (state: DappCenterState, action: DappCenterAction): DappCenterState => {
  return state;
};
