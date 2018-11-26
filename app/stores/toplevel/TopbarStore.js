// @flow
import { observable, action } from 'mobx';
import Store from '../base/Store';
import resolver from '../../utils/imports';
import environment from '../../environment';

const topbarConfig = resolver('config/topbarConfig');

export default class TopbarStore extends Store {

  CATEGORIES = topbarConfig.CATEGORIES;

  @observable activeTopbarCategory: string = this.CATEGORIES[0].route;

  setup() {
    const actions = this.actions.topbar;
    actions.activateTopbarCategory.listen(this._onactivateTopbarCategory);
    actions.walletSelected.listen(this._onWalletSelected);
    this.registerReactions([
      this._syncTopbarRouteWithRouter,
    ]);
  }

  @action _onactivateTopbarCategory = (
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

  @action _setactivateTopbarCategory = (
    category: string
  ): void => {
    this.activeTopbarCategory = category;
  };

  _syncTopbarRouteWithRouter = (): void => {
    const route = this.stores.app.currentRoute;
    this.CATEGORIES.forEach((category) => {
      // If the current route starts with the root of the category
      if (route.indexOf(category.route) === 0) this._setactivateTopbarCategory(category.route);
    });
  };
}
