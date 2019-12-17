// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Sidebar from '../components/topbar/Sidebar';
import type { InjectedProps } from '../types/injectedPropsType';

type Props = InjectedProps;

@observer
export default class SidebarContainer extends Component<Props> {

  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  render() {
    const { actions, stores } = this.props;
    const { topbar } = stores;

    return (
      <Sidebar
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );
  }
}
