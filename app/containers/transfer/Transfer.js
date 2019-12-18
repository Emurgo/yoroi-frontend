// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import SidebarContainer from '../SidebarContainer';
import TransferWithNavigation from '../../components/transfer/layouts/TransferWithNavigation';
import type { TransferNavigationProps } from '../../components/transfer/layouts/TransferWithNavigation';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import NavBar from '../../components/topbar/NavBar';
import globalMessages from '../../i18n/global-messages';

@observer
export default class Transfer extends Component<InjectedContainerProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

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
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(globalMessages.sidebarTransfer)} />
    );

    return (
      <MainLayout
        navbar={<NavBar title={navbarTitle} />}
        sidebar={sidebarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
        showAsCard
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
