// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import resolver from '../../utils/imports';
import environment from '../../environment';
import { TREZOR_T_CATEGORIE_WALLETS } from '../../config/topbarConfig';

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

    // If active wallet is TrezorTWallet then show it's Yoroi with Trezor Icon
    const { wallets } = this.stores.substores[environment.API];
    if (wallets && wallets.first && wallets.first.isTrezorTWallet) {
      this.CATEGORIES[0] = TREZOR_T_CATEGORIE_WALLETS;
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
