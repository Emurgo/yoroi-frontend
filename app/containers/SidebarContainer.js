// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Sidebar from '../components/topbar/Sidebar';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import ProfileActions from '../actions/profile-actions';
import TopbarActions from '../actions/topbar-actions';
import type { Category } from '../config/topbarConfig';

export type GeneratedData = {|
  +stores: {|
    +topbar: {|
      +isActiveCategory: Category => boolean,
      +categories: Array<Category>,
    |},
    +profile: {|
      +isSidebarExpanded: boolean,
    |},
  |},
  +actions: {|
    +profile: {|
      +toggleSidebar: {|
        +trigger: typeof ProfileActions.prototype.toggleSidebar.trigger
      |},
    |},
    +topbar: {|
      +activateTopbarCategory: {|
        +trigger: typeof TopbarActions.prototype.activateTopbarCategory.trigger
      |},
    |},
  |},
|};

@observer
export default class SidebarContainer extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SidebarContainer)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      stores: {
        topbar: {
          isActiveCategory: stores.topbar.isActiveCategory,
          categories: stores.topbar.categories,
        },
        profile: {
          isSidebarExpanded: stores.profile.isSidebarExpanded,
        },
      },
      actions: {
        profile: {
          toggleSidebar: { trigger: actions.profile.toggleSidebar.trigger },
        },
        topbar: {
          activateTopbarCategory: { trigger: actions.topbar.activateTopbarCategory.trigger },
        },
      },
    });
  }

  toggleSidebar: void => void = () => {
    this.generated.actions.profile.toggleSidebar.trigger();
  }

  render() {
    const { actions, stores } = this.generated;
    const { topbar, profile } = stores;

    return (
      <Sidebar
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
        onToggleSidebar={this.toggleSidebar}
        isSidebarExpanded={profile.isSidebarExpanded}
      />
    );
  }
}
