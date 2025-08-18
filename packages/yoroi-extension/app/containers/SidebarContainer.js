// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import { ROUTES } from '../routes-config';
import type { StoresProps } from '../stores';

@observer
export default class SidebarContainer extends Component<StoresProps> {
  toggleSidebar: void => Promise<void> = async () => {
    await this.props.stores.profile.toggleSidebar();
  };

  render(): Node {
    const { stores } = this.props;
    return (
      <SidebarRevamp
        onLogoClick={() => {
          stores.routing.goToRoute({
            route: ROUTES.WALLETS.ROOT,
          });
        }}
        onCategoryClicked={category => {
          stores.routing.goToRoute({
            route: category.route,
          });
        }}
        isActiveCategory={category => stores.routing.currentRoute.startsWith(category.route)}
        categories={allCategoriesRevamp.filter(category =>
          category.isVisible({
            hasAnyWallets: this.props.stores.wallets.hasAnyWallets === true,
            selected: this.props.stores.wallets.selected,
            currentRoute: this.props.stores.routing.currentRoute,
            isRewardWallet: wallet => stores.delegation.isRewardWallet(wallet.publicDeriverId),
          })
        )}
      />
    );
  }
}
