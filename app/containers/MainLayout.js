// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import type { Node } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import TopBarContainer from './TopBarContainer';
import SidebarLayout from '../components/layout/SidebarLayout';
import WalletAddPage from './wallet/WalletAddPage';
import type { StoresMap } from '../stores/index';
import type { ActionsMap } from '../actions/index';

export type MainLayoutProps = {
  stores: any | StoresMap,
  actions: any | ActionsMap,
  children: Node,
  topbar: ?any
};

@inject('stores', 'actions') @observer
export default class MainLayout extends Component<MainLayoutProps> {
  static defaultProps = {
    actions: null,
    stores: null,
    children: null,
    topbar: null,
    onClose: () => {}
  };

  render() {
    const { actions, stores, topbar } = this.props;
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

    const topbarComponent = topbar || (<TopBarContainer actions={actions} stores={stores} />);

    return (
      <SidebarLayout
        /* sidebar={sidebarComponent} */
        topbar={topbarComponent}
        notification={<div />}
        contentDialogs={[<WalletAddPage key="WalletAddPage" />]}
      >
        {this.props.children}
      </SidebarLayout>
    );
  }
}
