// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import environment from '../../environment';

type Props = InjectedContainerProps;

@observer
export default class Wallet extends Component<Props> {

  isActiveScreen = (page: string): boolean => {
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
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    if (!wallets.selected) {
      return (
        <MainLayout
          topbar={topbarContainer}
          actions={actions}
          stores={stores}
          connectionErrorType={checkAdaServerStatus}
        >
          <LoadingSpinner />
        </MainLayout>
      );
    }

    return (
      <MainLayout
        topbar={topbarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
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
