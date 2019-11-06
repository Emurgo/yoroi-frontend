// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';
import StakingWithNavigation from '../../components/staking/layouts/StakingWithNavigation';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { buildRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';
import type { InjectedContainerProps } from '../../types/injectedPropsType';

type Props = InjectedContainerProps;

@observer
export default class Staking extends Component<Props> {

  isActiveScreen = (page: string): boolean => {
    const { app } = this.props.stores;
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return false;
    const screenRoute = buildRoute(
      ROUTES.STAKING.PAGE,
      {
        id: selected.self.getPublicDeriverId(),
        page
      }
    );
    return app.currentRoute === screenRoute;
  };

  handleStakingNavItemClick = (page: string): void => {
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return;
    this.props.actions.router.goToRoute.trigger({
      route: ROUTES.STAKING.PAGE,
      params: { id: selected.self.getPublicDeriverId(), page },
    });
  };

  render() {
    const { wallets, } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    if (!wallets.selected) {
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
        <StakingWithNavigation
          isActiveScreen={this.isActiveScreen}
          onWalletNavItemClick={this.handleStakingNavItemClick}
        >
          {this.props.children}
        </StakingWithNavigation>
      </MainLayout>
    );
  }
}
