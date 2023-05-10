// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Sidebar from '../components/topbar/Sidebar';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { allCategories, allCategoriesRevamp } from '../stores/stateless/sidebarCategories';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import SidebarRevamp from '../components/topbar/SidebarRevamp';
import { withLayout } from '../styles/context/layout';
import type { LayoutComponentMap } from '../styles/context/layout';
import type { DelegationRequests } from '../stores/toplevel/DelegationStore';

export type GeneratedData = typeof SidebarContainer.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
  +onLogoClick?: void => void,
|};
type InjectedProps = {|
  +selectedLayout: string,
  +renderLayoutComponent: LayoutComponentMap => Node,
|};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class SidebarContainer extends Component<AllProps> {
  toggleSidebar: void => Promise<void> = async () => {
    await this.generated.actions.profile.toggleSidebar.trigger();
  };

  render(): Node {
    const { stores, actions } = this.generated;
    const { profile } = stores;
    const { onLogoClick } = this.props;

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
        onLogoClick={onLogoClick}
        onCategoryClicked={category => {
          actions.router.goToRoute.trigger({
            route: category.route,
          });
        }}
        isActiveCategory={category => stores.app.currentRoute.startsWith(category.route)}
        categories={allCategoriesRevamp.filter(category =>
          category.isVisible({
            hasAnyWallets: this.generated.stores.wallets.hasAnyWallets,
            selected: this.generated.stores.wallets.selected,
            currentRoute: this.generated.stores.app.currentRoute,
            isRewardWallet: (publicDeriver: PublicDeriver<>) =>
              stores.delegation.getDelegationRequests(publicDeriver) != null,
          })
        )}
      />
    );

    return this.props.renderLayoutComponent({
      CLASSIC: SidebarComponent,
      REVAMP: SidebarRevampComponent,
    });
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        toggleSidebar: {|
          trigger: (params: void) => Promise<void>,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      profile: {| isSidebarExpanded: boolean |},
      wallets: {|
        hasAnyWallets: boolean,
        selected: null | PublicDeriver<>,
      |},
      delegation: {|
        getDelegationRequests: (PublicDeriver<>) => void | DelegationRequests,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SidebarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        profile: {
          isSidebarExpanded: stores.profile.isSidebarExpanded,
        },
        app: {
          currentRoute: stores.app.currentRoute,
        },
        wallets: {
          selected: stores.wallets.selected,
          hasAnyWallets: stores.wallets.hasAnyWallets,
        },
        delegation: {
          getDelegationRequests: stores.delegation.getDelegationRequests,
        },
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: actions.profile.toggleSidebar.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
export default (withLayout(SidebarContainer): ComponentType<Props>);
