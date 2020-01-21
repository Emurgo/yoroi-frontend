// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';
import SidebarContainer from '../SidebarContainer';
import TransferWithNavigation from '../../components/transfer/layouts/TransferWithNavigation';
import type { TransferNavigationProps } from '../../components/transfer/layouts/TransferWithNavigation';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';


@observer
export default class Transfer extends Component<InjectedContainerProps> {

  isActiveScreen : $PropertyType<TransferNavigationProps, 'isActiveNavItem'> = page => {
    const { app } = this.props.stores;
    return app.currentRoute.endsWith(page);
  };

  handleTransferNavItemClick : $PropertyType<TransferNavigationProps, 'onNavItemClick'> = page => {

    this.props.actions.router.goToRoute.trigger({
      route: { daedalus: ROUTES.TRANSFER.DAEDALUS, yoroi: ROUTES.TRANSFER.YOROI }[page],
    });
  }

  render() {
    const { actions, stores } = this.props;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    return (
      <MainLayout
        topbar={topbarContainer}
        sidebar={sidebarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        <TransferWithNavigation
          isActiveScreen={this.isActiveScreen}
          onTransferNavItemClick={this.handleTransferNavItemClick}
        >
          {this.props.children}
        </TransferWithNavigation>
      </MainLayout>
    );
  }
}
