// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Sidebar from '../components/sidebar/Sidebar';
import TopBarContainer from './TopBarContainer';
import SidebarLayout from '../components/layout/SidebarLayout';
import WalletAddPage from './wallet/WalletAddPage';
import type { InjectedContainerProps } from '../types/injectedPropsType';

@inject('stores', 'actions') @observer
export default class MainLayout extends Component<InjectedContainerProps> {
  static defaultProps = {
    actions: null,
    stores: null,
    children: null,
    onClose: () => {}
  };

  render() {
    const { actions, stores } = this.props;
    const { sidebar } = stores;

    const sidebarComponent = (
      <Sidebar
        isShowingSubMenus={false}
        categories={sidebar.CATEGORIES}
        activeSidebarCategory={sidebar.activeSidebarCategory}
        onCategoryClicked={category => {
          actions.sidebar.activateSidebarCategory.trigger({ category });
        }}
        isSynced
        openDialogAction={actions.dialogs.open.trigger}
        isDialogOpen={stores.uiDialogs.isOpen}
      />
    );
    return (
      <SidebarLayout
        sidebar={sidebarComponent}
        topbar={<TopBarContainer actions={actions} stores={stores} />}
        notification={<div />}
        contentDialogs={[<WalletAddPage key="WalletAddPage" />]}
      >
        {this.props.children}
      </SidebarLayout>
    );
  }
}
