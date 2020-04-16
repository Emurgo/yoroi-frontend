// @flow
import { observable, computed, action } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import type { Category } from '../../config/topbarConfig';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import {
  WITH_LEDGER_NANO,
  WITH_TREZOR_T,
  BACK_TO_ADD,
  BACK_TO_MY_WALLETS,
  WALLETS,
  TRANSFER_PAGE,
  SETTINGS,
  NOTICE_BOARD,
} from '../../config/topbarConfig';
import {
  isTrezorTWallet,
  isLedgerNanoWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { Bip44Wallet } from '../../api/ada/lib/storage/models/Bip44Wallet/wrapper';

export default class TopbarStore extends Store {

  @observable activeTopbarCategory: ?string = ROUTES.MY_WALLETS;

  setup(): void {
    super.setup();
    this.isActiveCategory = this.isActiveCategory.bind(this);
    this.actions.topbar.activateTopbarCategory.listen(this._onActivateTopbarCategory);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  _genTopCategory: void => Category = () => {
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

    let isTrezorT = false;
    let isNano = false;
    const selected = wallets.selected;
    if (selected != null) {
      const conceptualWallet = selected.getParent();
      isTrezorT = isTrezorTWallet(conceptualWallet);
      isNano = isLedgerNanoWallet(conceptualWallet);
    }

    // recall: legacy bip44 wallets can't receive in Shelley era
    const canTransfer = !environment.isShelley() ||
      !(selected != null && selected.getParent() instanceof Bip44Wallet);

    return [
      this._genTopCategory(),
      ...(isTrezorT ? [WITH_TREZOR_T] : []),
      ...(isNano ? [WITH_LEDGER_NANO] : []),
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
    () => this.activeTopbarCategory != null && this.activeTopbarCategory === category.route
  ).get();

  @action _onActivateTopbarCategory: {| category: string |} => void = (
    params
  ) => {
    const { category } = params;
    if (category !== this.activeTopbarCategory) {
      this.actions.router.goToRoute.trigger({ route: category });
    }
  };

  @action _setActivateTopbarCategory: (void | string) => void = (
    category
  ) => {
    this.activeTopbarCategory = category;
  };

  _syncTopbarRouteWithRouter: void => void = () => {
    const route = this.stores.app.currentRoute;
    if (matchRoute(ROUTES.WALLETS.ADD, route) && this.stores.wallets.hasAnyPublicDeriver) {
      this._setActivateTopbarCategory(undefined);
    }
    this.categories.forEach((category) => {
      // If the current route starts with the route of the category
      // E.g. category could be settings, and route could be settings/general
      if (route.indexOf(category.route) === 0) this._setActivateTopbarCategory(category.route);
    });
  };
}
