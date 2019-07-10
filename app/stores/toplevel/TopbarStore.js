// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import type { Category } from '../../config/topbarConfig';
import {
  WITH_LEDGER_NANO_S,
  WITH_TREZOR_T,
  GO_BACK,
  WALLETS,
  CURRENCY_SPECIFIC_CATEGORIES,
  SETTINGS
} from '../../config/topbarConfig';

export default class TopbarStore extends Store {

  @observable activeTopbarCategory: string = WALLETS.route;

  setup() {
    this.isActiveCategory = this.isActiveCategory.bind(this);
    this.actions.topbar.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    this.actions.topbar.walletSelected.listen(this._onWalletSelected);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  @computed get categories(): Array<Category> {
    const { wallets } = this.stores.substores[environment.API];
    return [
      (wallets && !wallets.hasAnyLoaded) ? GO_BACK : WALLETS,
      ...(wallets && wallets.first && wallets.first.isTrezorTWallet) ? [WITH_TREZOR_T] : [],
      ...(wallets && wallets.first && wallets.first.isLedgerNanoSWallet) ? [WITH_LEDGER_NANO_S] : [],
      SETTINGS,
      ...CURRENCY_SPECIFIC_CATEGORIES[environment.API],
    ];
  }

  // @computed decorator for methods with parameters are not supported in this
  // version of mobx. Instead, making a regular function that calls `computed`
  isActiveCategory = category => {
    return computed(
      () => this.activeTopbarCategory && this.activeTopbarCategory === category.route
    ).get();
  }

  @action _onActivateTopbarCategory = (
    params: { category: string, }
  ): void => {
    const { category } = params;
    if (category !== this.activeTopbarCategory) {
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
    this.categories.forEach((category) => {
      // If the current route starts with the route of the category
      // E.g. category could be settings, and route could be settings/general
      if (route.indexOf(category.route) === 0) this._setActivateTopbarCategory(category.route);
    });
  };
}
