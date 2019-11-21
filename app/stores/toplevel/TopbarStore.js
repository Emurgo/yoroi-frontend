// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import type { Category } from '../../config/topbarConfig';
import {
  WITH_LEDGER_NANO,
  WITH_TREZOR_T,
  GO_BACK,
  WALLETS,
  CURRENCY_SPECIFIC_CATEGORIES,
  SETTINGS
} from '../../config/topbarConfig';
import {
  isTrezorTWallet,
  isLedgerNanoWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';

export default class TopbarStore extends Store {

  @observable activeTopbarCategory: string = WALLETS.route;

  setup(): void {
    this.isActiveCategory = this.isActiveCategory.bind(this);
    this.actions.topbar.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  @computed get categories(): Array<Category> {
    const { wallets } = this.stores.substores[environment.API];

    let isTrezorT = false;
    let isNano = false;
    const selected = wallets.selected;
    if (selected != null) {
      const conceptualWallet = selected.self.getParent();
      isTrezorT = isTrezorTWallet(conceptualWallet);
      isNano = isLedgerNanoWallet(conceptualWallet);
    }

    return [
      (wallets && !wallets.hasAnyPublicDeriver) ? GO_BACK : WALLETS,
      ...(isTrezorT ? [WITH_TREZOR_T] : []),
      ...(isNano ? [WITH_LEDGER_NANO] : []),
      SETTINGS,
      ...CURRENCY_SPECIFIC_CATEGORIES[environment.API],
    ];
  }

  // @computed decorator for methods with parameters are not supported in this
  // version of mobx. Instead, making a regular function that calls `computed`
  isActiveCategory: Category => boolean = (
    category: Category
  ): boolean => computed(
    () => this.activeTopbarCategory && this.activeTopbarCategory === category.route
  ).get();

  @action _onActivateTopbarCategory = (
    params: { category: string, }
  ): void => {
    const { category } = params;
    if (category !== this.activeTopbarCategory) {
      this.actions.router.goToRoute.trigger({ route: category });
    }
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
