import { BigNumber } from 'bignumber.js';
import UiDialogsStore from './UiDialogsStore';
import WalletTransaction from '../domain/WalletTransaction';

const ada = {
  wallets: {
    active: {
      amount: new BigNumber(1000)
    },
    assurance: 'NORMAL'
  },
  transactions: {
    hasAny: false,
    totalAvailable: 10,
    recent: [],
    recentTransactionsRequest: 0,
    unconfirmedAmount: {
      incoming: new BigNumber(0),
      outgoing: new BigNumber(100)
    }
  }
};

const sidebar = {
  isShowingSubMenus: false
};

const app = {
  currentRoute: '/wallets/123213123'
};

const uiDialogs = {
  isOpen: false,
}

const stores = {
  ada,
  app,
  sidebar,
  uiDialogs: new UiDialogsStore()
};

export const getFakeStores = () => stores;
