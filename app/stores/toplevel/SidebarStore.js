// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import type { Category } from '../../config/sidebarConfig';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  BACK_TO_ADD,
  BACK_TO_MY_WALLETS,
  WALLETS,
  TRANSFER_PAGE,
  SETTINGS,
  NOTICE_BOARD,
} from '../../config/sidebarConfig';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';

export default class SidebarStore extends Store {

  @observable activeSidebarCategory: ?string = ROUTES.MY_WALLETS;

  setup(): void {
    super.setup();
    this.isActiveCategory = this.isActiveCategory.bind(this);
    this.actions.sidebar.activateSidebarCategory.listen(this._onActivateSidebarCategory);
    this.registerReactions([
      this._syncSidebarRouteWithRouter,
    ]);
  }

  _genSidebarCategory: void => Category = () => {
    const { wallets } = this.stores;
    if (!wallets.hasAnyPublicDeriver) {
      return BACK_TO_ADD;
    }
    const selected = wallets.selected;
    if (selected == null) {
      const currentRoute = this.stores.app.currentRoute;
      if (matchRoute(ROUTES.WALLETS.ADD, currentRoute)) {
        return BACK_TO_MY_WALLETS;
      }
      return WALLETS(ROUTES.MY_WALLETS);
    }
    return WALLETS(this.stores.wallets.getWalletRoute(selected));
  }

  @computed get categories(): Array<Category> {
    const { wallets } = this.stores;

    const selected = wallets.selected;

    // recall: legacy bip44 wallets can't receive in Shelley era
    const canTransfer = !environment.isJormungandr() ||
      !(selected != null && selected.getParent() instanceof Bip44Wallet);

    return [
      this._genSidebarCategory(),
      SETTINGS,
      ...(canTransfer ? [TRANSFER_PAGE] : []),
      ...(environment.isTest() ? [NOTICE_BOARD] : []), // Temporarily Hide
    ];
  }

  // @computed decorator for methods with parameters are not supported in this
  // version of mobx. Instead, making a regular function that calls `computed`
  isActiveCategory: Category => boolean = (
    category: Category
  ): boolean => computed(
    () => this.activeSidebarCategory != null && this.activeSidebarCategory === category.route
  ).get();

  @action _onActivateSidebarCategory: {| category: string |} => void = (
    params
  ) => {
    const { category } = params;
    if (category !== this.activeSidebarCategory) {
      this.actions.router.goToRoute.trigger({ route: category });
    }
  };

  @action _setActivateSidebarCategory: (void | string) => void = (
    category
  ) => {
    this.activeSidebarCategory = category;
  };

  _syncSidebarRouteWithRouter: void => void = () => {
    const route = this.stores.app.currentRoute;
    if (matchRoute(ROUTES.WALLETS.ADD, route) && this.stores.wallets.hasAnyPublicDeriver) {
      this._setActivateSidebarCategory(undefined);
    }
    this.categories.forEach((category) => {
      // If the current route starts with the route of the category
      // E.g. category could be settings, and route could be settings/general
      if (route.indexOf(category.route) === 0) this._setActivateSidebarCategory(category.route);
    });
  };
}
