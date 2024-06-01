// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import Sidebar from '../components/topbar/Sidebar';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { allCategories, allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import { withLayout } from '../styles/context/layout';
import type { LayoutComponentMap } from '../styles/context/layout';
import { ROUTES } from '../routes-config';

type Props = {|
  ...StoresAndActionsProps,
|};
type InjectedLayoutProps = {|
  +selectedLayout: string,
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class SidebarContainer extends Component<AllProps> {
  toggleSidebar: void => Promise<void> = async () => {
    await this.props.actions.profile.toggleSidebar.trigger();
  };

  render(): Node {
    const { stores, actions } = this.props;
    const { profile } = stores;

    const SidebarComponent = (
      <Sidebar
        onCategoryClicked={category => {
          actions.router.goToRoute.trigger({
            route: category.route,
          });
        }}
        isActiveCategory={category => stores.app.currentRoute.startsWith(category.route)}
        categories={allCategories.filter(category =>
          category.isVisible({
            hasAnyWallets: stores.wallets.hasAnyWallets === true,
            selected: stores.wallets.selected?.publicDeriverId,
            currentRoute: stores.app.currentRoute,
          })
        )}
        onToggleSidebar={this.toggleSidebar}
        isSidebarExpanded={profile.isSidebarExpanded}
      />
    );

    const SidebarRevampComponent = (
      <SidebarRevamp
        onLogoClick={() => {
          actions.router.goToRoute.trigger({
            route: ROUTES.WALLETS.TRANSACTIONS,
            publicDeriverId: stores.wallets.selected?.publicDeriverId,
          });
        }}
        onCategoryClicked={category => {
          actions.router.goToRoute.trigger({
            route: category.route,
          });
        }}
        isActiveCategory={category => stores.app.currentRoute.startsWith(category.route)}
        categories={allCategoriesRevamp.filter(category =>
          category.isVisible({
            hasAnyWallets: this.props.stores.wallets.hasAnyWallets === true,
            selected: this.props.stores.wallets.selected?.publicDeriverId,
            currentRoute: this.props.stores.app.currentRoute,
            isRewardWallet: (publicDeriverId: number) =>
              stores.delegation.isRewardWallet(publicDeriverId),
          })
        )}
      />
    );

    return this.props.renderLayoutComponent({
      CLASSIC: SidebarComponent,
      REVAMP: SidebarRevampComponent,
    });
  }
}
export default (withLayout(SidebarContainer): ComponentType<Props>);
