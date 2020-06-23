// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Sidebar from '../components/topbar/Sidebar';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import type { Category } from '../config/sidebarConfig';

export type GeneratedData = typeof SidebarContainer.prototype.generated;

@observer
export default class SidebarContainer extends Component<InjectedOrGenerated<GeneratedData>> {

  toggleSidebar: void => Promise<void> = async () => {
    await this.generated.actions.profile.toggleSidebar.trigger();
  }

  render(): Node {
    const { actions, stores } = this.generated;
    const { sidebar, profile } = stores;

    return (
      <Sidebar
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        isActiveCategory={sidebar.isActiveCategory}
        categories={sidebar.categories}
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
      sidebar: {|
        activateSidebarCategory: {|
          trigger: (params: {| category: string |}) => void
        |}
      |}
    |},
    stores: {|
      profile: {| isSidebarExpanded: boolean |},
      sidebar: {|
        categories: Array<Category>,
        isActiveCategory: Category => boolean
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
        sidebar: {
          isActiveCategory: stores.sidebar.isActiveCategory,
          categories: stores.sidebar.categories,
        },
        profile: {
          isSidebarExpanded: stores.profile.isSidebarExpanded,
        },
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: actions.profile.toggleSidebar.trigger },
        },
        sidebar: {
          activateSidebarCategory: { trigger: actions.sidebar.activateSidebarCategory.trigger },
        },
      },
    });
  }
}
