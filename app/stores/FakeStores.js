import UiDialogsStore from './UiDialogsStore';
import WalletTransaction from '../domain/WalletTransaction';
import AdaStore from './ada/index';

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
  ada: AdaStore,
  app,
  sidebar,
  uiDialogs: new UiDialogsStore()
};

export const getFakeStores = () => stores;
