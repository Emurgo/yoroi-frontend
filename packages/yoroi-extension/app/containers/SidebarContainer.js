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
            hasAnyWallets: stores.wallets.hasAnyWallets,
            selected: stores.wallets.selected,
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
            publicDeriver: stores.wallets.selected,
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
            hasAnyWallets: this.props.stores.wallets.hasAnyWallets,
            selected: this.props.stores.wallets.selected,
            currentRoute: this.props.stores.app.currentRoute,
            isRewardWallet: (publicDeriver: PublicDeriver<>) =>
              stores.delegation.isRewardWallet(publicDeriver),
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
