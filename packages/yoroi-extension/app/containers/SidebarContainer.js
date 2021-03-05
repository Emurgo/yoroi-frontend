
// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Sidebar from '../components/topbar/Sidebar';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { allCategories } from '../stores/stateless/sidebarCategories';
import { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';

export type GeneratedData = typeof SidebarContainer.prototype.generated;

@observer
export default class SidebarContainer extends Component<InjectedOrGenerated<GeneratedData>> {

  toggleSidebar: void => Promise<void> = async () => {
    await this.generated.actions.profile.toggleSidebar.trigger();
  }

  render(): Node {
    const { stores } = this.generated;
    const { profile } = stores;

    return (
      <Sidebar
        onCategoryClicked={category => {
          this.generated.actions.router.goToRoute.trigger({
            route: category.route,
          });
        }}
        isActiveCategory={
          category => this.generated.stores.app.currentRoute.startsWith(category.route)
        }
        categories={allCategories.filter(category => category.isVisible({
          hasAnyWallets: this.generated.stores.wallets.hasAnyWallets,
          selected: this.generated.stores.wallets.selected,
          currentRoute: this.generated.stores.app.currentRoute,
        }))}
        onToggleSidebar={this.toggleSidebar}
        isSidebarExpanded={profile.isSidebarExpanded}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        toggleSidebar: {|
          trigger: (params: void) => Promise<void>
        |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      profile: {| isSidebarExpanded: boolean |},
      wallets: {|
        hasAnyWallets: boolean,
        selected: null | PublicDeriver<>
      |}
    |}
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
