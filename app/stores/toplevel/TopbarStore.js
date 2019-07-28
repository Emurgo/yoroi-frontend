// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import { Logger } from '../../utils/logging';
import {
  WITH_LEDGER_NANO_S_CATEGORIE as WITH_LEDGER_NANO_S,
  WITH_TREZOR_T_CATEGORIE as WITH_TREZOR_T,
  GO_BACK_CATEGORIE as GO_BACK,
  WALLETS_CATEGORIE as WALLETS,
  CURRENCY_SPECIFIC_CATEGORIES,
  COMMON_CATEGORIES,
} from '../../config/topbarConfig';

export default class TopbarStore extends Store {
  CATEGORIES = [...COMMON_CATEGORIES, ...CURRENCY_SPECIFIC_CATEGORIES[environment.API]];

  @observable activeTopbarCategory: string = WALLETS.route;

  setup() {
    const actions = this.actions.topbar;
    actions.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    actions.walletSelected.listen(this._onWalletSelected);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  /** Dynamic Initialization of Topbar Categories */
  @action updateCategories(): void {
    const { wallets } = this.stores.substores[environment.API];
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
    }
  }

  /** Reset Categories to defaults */
  @action _resetCategories(): void {
    this.CATEGORIES = [...COMMON_CATEGORIES, ...CURRENCY_SPECIFIC_CATEGORIES[environment.API]];
    this.activeTopbarCategory = WALLETS.route;
  }

  @action _onActivateTopbarCategory = (
    params: { category: string, }
  ): void => {
    const { category } = params;
    if (category !== this.activeTopbarCategory) {

      // Resetting Categories to defaults, as Categories are originally designed to be static
      // but for making it dynamic this is the patch
      if (category === GO_BACK.route) {
        this._resetCategories();
      }

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
