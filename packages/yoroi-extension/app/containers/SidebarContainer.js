// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import Sidebar from '../components/topbar/Sidebar';
import type { StoresAndActionsProps } from '../types/injectedProps.types';
import { allCategories, allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import type { SidebarCategoryRevamp } from '../stores/stateless/sidebarCategories';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import { withLayout } from '../styles/context/layout';
import type { LayoutComponentMap } from '../styles/context/layout';
import { ROUTES } from '../routes-config';
import { runInAction } from 'mobx';

type Props = {|
  ...StoresAndActionsProps,
|};
type InjectedLayoutProps = {|
  +selectedLayout: string,
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

type State = {|
  featureFlags: { [string]: boolean },
|};

@observer
class SidebarContainer extends Component<AllProps, State> {

  state: State = {
    featureFlags: {},
  };

  toggleSidebar: void => Promise<void> = async () => {
    await this.props.actions.profile.toggleSidebar.trigger();
  };

  componentDidMount(): * {
    allCategoriesRevamp.forEach(c => {
      const feature = c.featureFlagName;
      if (feature != null) {
        this.props.stores.wallets.getRemoteFeatureFlag(feature)
          .then((flag: ?boolean) => {
            if (flag) {
              runInAction(() => {
                this.setState(s => ({
                  featureFlags: { ...s.featureFlags, [feature]: true },
                }));
              });
            }
            return null;
          })
          .catch(e => {
            console.error('Failed to resolve remote flag for feature: ' + feature, e);
          });
      }
    })
  }

  categoryFeatureFlagEnabled(category: SidebarCategoryRevamp): boolean {
    return category.featureFlagName == null || this.state.featureFlags[category.featureFlagName];
  }

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
            route: ROUTES.WALLETS.ROOT,
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
            selected: this.props.stores.wallets.selected,
            currentRoute: this.props.stores.app.currentRoute,
            isRewardWallet: (wallet) =>
              stores.delegation.isRewardWallet(wallet.publicDeriverId),
          })
          && this.categoryFeatureFlagEnabled(category)
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
