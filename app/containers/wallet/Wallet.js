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
import AdaRedemptionSuccessOverlay from '../../components/wallet/ada-redemption/AdaRedemptionSuccessOverlay';
import environment from '../../environment';

type Props = InjectedContainerProps;

@observer
export default class Wallet extends Component<Props> {

  isActiveScreen = (page: string) => {
    const { app } = this.props.stores;
    const { wallets } = this.props.stores.substores.ada;
    if (!wallets.active) return false;
    const screenRoute = buildRoute(ROUTES.WALLETS.PAGE, { id: wallets.active.id, page });
    return app.currentRoute === screenRoute;
  };

  handleWalletNavItemClick = (page: string) => {
    const { wallets } = this.props.stores.substores.ada;
    if (!wallets.active) return;
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.WALLETS.PAGE,
      params: { id: wallets.active.id, page },
    });
  };

  render() {
    const { wallets, adaRedemption } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const { showAdaRedemptionSuccessMessage, amountRedeemed } = adaRedemption;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    if (!wallets.active) {
      return (
        <MainLayout
          topbar={topbarContainer}
          actions={actions}
          stores={stores}
          classicTheme={profile.isClassicTheme}
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
        classicTheme={profile.isClassicTheme}
        connectionErrorType={checkAdaServerStatus}
      >
        <WalletWithNavigation
          isActiveScreen={this.isActiveScreen}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.props.children}
        </WalletWithNavigation>

        {showAdaRedemptionSuccessMessage ? (
          <AdaRedemptionSuccessOverlay
            amount={amountRedeemed}
            onClose={() => actions.ada.adaRedemption.closeAdaRedemptionSuccessOverlay.trigger()}
            classicTheme={profile.isClassicTheme}
          />
        ) : null}
      </MainLayout>
    );
  }
}
