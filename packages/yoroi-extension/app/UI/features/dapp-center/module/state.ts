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
  unitOfAccount: CurrencyType;
  settingFiatPairUnit: {
    currency: CurrencyType;
    enabled: boolean;
  };
  accountPair: AccountPair | null;
  walletBalance: WalletBalance | null;
  networkId: number | null;
  ftAssetList: any[];
  showWelcomeBanner: boolean;
  primaryTokenInfo: any;
  openBuyDialog: () => void;
  backendServiceZero: string;
  explorer: { tokenInfo: { name: string; baseUrl: string } };
};

// Define default state
export const defaultDappCenterState: DappCenterState = {
  unitOfAccount: 'ADA',
  settingFiatPairUnit: {
    currency: null,
    enabled: false,
  },
  accountPair: null,
  walletBalance: null,
  networkId: null,
  ftAssetList: [],
  primaryTokenInfo: null,
  showWelcomeBanner: false,
  openBuyDialog: () => { },
  backendServiceZero: '',
  explorer: { tokenInfo: { name: '', baseUrl: '' } },
};

// Define action handlers
export const defaultDappCenterActions: DappCenterActions = {
};

// Reducer function
export const DappCenterReducer = (state: DappCenterState, action: DappCenterAction): DappCenterState => {
  return produce(state, draft => {
    switch (action.type) {
      case DappCenterActionType.changeUnitOfAccount:
        draft.unitOfAccount = action.unitOfAccount;
        break;
      case DappCenterActionType.changeUnitOfAccountPair:
        draft.accountPair = action.accountPair;
        break;
      default:
        return;
    }
  });
};
