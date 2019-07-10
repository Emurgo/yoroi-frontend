// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import { Logger } from '../../utils/logging';
import type { Category } from '../../config/topbarConfig';
import {
  WITH_LEDGER_NANO_S_CATEGORY as WITH_LEDGER_NANO_S,
  WITH_TREZOR_T_CATEGORY as WITH_TREZOR_T,
  GO_BACK_CATEGORY as GO_BACK,
  WALLETS_CATEGORY as WALLETS,
  CURRENCY_SPECIFIC_CATEGORIES,
  COMMON_CATEGORIES,
} from '../../config/topbarConfig';

export default class TopbarStore extends Store {

  @observable activeTopbarCategory: string = WALLETS.route;

  setup() {
    this.actions.topbar.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    this.actions.topbar.walletSelected.listen(this._onWalletSelected);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  @computed get categories(): Array<Category> {
    return [...COMMON_CATEGORIES, ...CURRENCY_SPECIFIC_CATEGORIES[environment.API]];
  }

  @computed get isActiveCategory(): boolean {
    //return (route => (this.activeTopbarCategory && this.activeTopbarCategory === route));
    return false; // TODO
  }

  /** Dynamic Initialization of Topbar Categories */
  @action updateCategories(): void {
    /*const { wallets } = this.stores.substores[environment.API];
    // set it to the default
    this.CATEGORIES = [...COMMON_CATEGORIES, ...CURRENCY_SPECIFIC_CATEGORIES[environment.API]];

    // For rare of the rare case, make sure wallets store is initialized
    if (wallets) {
      // If active wallet is TrezorTWallet then show with Trezor T Icon
      if (wallets.first && wallets.first.isTrezorTWallet) {
        this.CATEGORIES.push(WITH_TREZOR_T);
      }

      // If active wallet is LedgerNanoSWallet then show with Ledger Nano S Icon
      if (wallets.first && wallets.first.isLedgerNanoSWallet) {
        this.CATEGORIES.push(WITH_LEDGER_NANO_S);
      }

      // If there is not any active wallets then replace WALLETS Category by GO_BACK Category
      if (!wallets.hasAnyLoaded) {
        // eslint-disable-next-line arrow-body-style
        const walletCategoryIndex = this.CATEGORIES.findIndex((item) => {
          return item.name === WALLETS.name;
        });
        this.CATEGORIES[walletCategoryIndex] = GO_BACK;
      }
    } else {
      Logger.warn('TopbarStore::updateCategories::Wallets store is not ready yet');
    }*/
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
