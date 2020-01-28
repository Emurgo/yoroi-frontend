// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import MainLayout from '../MainLayout';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import SidebarContainer from '../SidebarContainer';
import NavBarContainer from '../NavBarContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import environment from '../../environment';

type Props = InjectedContainerProps;

@observer
export default class Wallet extends Component<Props> {

  isActiveScreen = (page: string, subpage: ?boolean): boolean => {
    const { app } = this.props.stores;
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return false;
    const screenRoute = buildRoute(
      ROUTES.WALLETS.PAGE,
      {
        id: selected.self.getPublicDeriverId(),
        page
      }
    );
    if (subpage === true) {
      return app.currentRoute.indexOf(screenRoute) !== -1;
    }
    return app.currentRoute === screenRoute;
  };

  handleWalletNavItemClick = (page: string): void => {
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return;
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.PAGE,
      params: { id: selected.self.getPublicDeriverId(), page },
    });
  };

  render() {
    const { wallets, } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);
    const navbarContainer = (<NavBarContainer actions={actions} stores={stores} />);

    if (!wallets.selected) {
      return (
        <MainLayout
          navbar={navbarContainer}
          actions={actions}
          stores={stores}
          connectionErrorType={checkAdaServerStatus}
          showInContainer
        >
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </MainLayout>
      );
    }

    return (
      <MainLayout
        sidebar={sidebarContainer}
        navbar={navbarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
      >
        <WalletWithNavigation
          isActiveScreen={this.isActiveScreen}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.props.children}
        </WalletWithNavigation>
      </MainLayout>
    );
  }
}
