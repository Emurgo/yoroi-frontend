import environment from '../environment';
import { BigNumber } from 'bignumber.js';

const stores = {
  [environment.API]: {
    wallets: {
      active: {
        amount: new BigNumber(1000)
      }
    }
  },
  app: {
    currentRoute: '/wallets/123213123'
  },
  sidebar: {
    isShowingSubMenus: false
  }
};

export const getFakeStores = () => stores;
