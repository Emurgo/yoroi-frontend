// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import resolver from '../../utils/imports';
import environment from '../../environment';
import {
  WITH_LEDGER_NANO_S_CATEGORIE as WITH_LEDGER_NANO_S,
  WITH_TREZOR_T_CATEGORIE as WITH_TREZOR_T,
} from '../../config/topbarConfig';

const topbarConfig = resolver('config/topbarConfig');

export default class TopbarStore extends Store {
  CATEGORIES = topbarConfig.CATEGORIES;

  @observable activeTopbarCategory: string = this.CATEGORIES[0].route;

  setup() {
    const actions = this.actions.topbar;
    actions.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    actions.walletSelected.listen(this._onWalletSelected);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  /** Dynamic Initialization of Topbar Categories */
  @action initCategories() {
    this.CATEGORIES = topbarConfig.CATEGORIES;

    const { wallets } = this.stores.substores[environment.API];
    // If active wallet is TrezorTWallet then show with Trezor T Icon
    if (wallets && wallets.first && wallets.first.isTrezorTWallet
      && !this.CATEGORIES.find(category => category.name === WITH_TREZOR_T.name)) {
      this.CATEGORIES.push(WITH_TREZOR_T);
    }

    // If active wallet is LedgerNanoSWallet then show with Ledger Nano S Icon
    if (wallets && wallets.first && wallets.first.isLedgerNanoSWallet
      && !this.CATEGORIES.find(category => category.name === WITH_LEDGER_NANO_S.name)) {
      this.CATEGORIES.push(WITH_LEDGER_NANO_S);
    }

    this.activeTopbarCategory = this.CATEGORIES[0].route;
  }

  @action _onActivateTopbarCategory = (
    params: { category: string, }
  ): void => {
    const { category } = params;
    if (category !== this.activeTopbarCategory) {
      this.activeTopbarCategory = category;
      this.actions.router.goToRoute.trigger({ route: category });
    }
  };

  @action _onWalletSelected = (
    { walletId }: { walletId: string }
  ): void => {
    this.stores.substores[environment.API].wallets.goToWalletRoute(walletId);
  };

  @action _setActivateTopbarCategory = (
    category: string
  ): void => {
    this.activeTopbarCategory = category;
  };

  _syncTopbarRouteWithRouter = (): void => {
    const route = this.stores.app.currentRoute;
    this.CATEGORIES.forEach((category) => {
      // If the current route starts with the root of the category
      if (route.indexOf(category.route) === 0) this._setActivateTopbarCategory(category.route);
    });
  };
}
