// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';
import TransferWithNavigation from '../../components/transfer/layouts/TransferWithNavigation';
import { ROUTES } from '../../routes-config';
import environment from '../../environment';

type TransferNavigationPageName = 'daedalus' | 'yoroi';

@observer
export default class Transfer extends Component<InjectedContainerProps> {

  isActiveScreen = (page: TransferNavigationPageName) => {
    const { app } = this.props.stores;
    return app.currentRoute.endsWith(page);
  };

  handleTransferNavItemClick = (page: TransferNavigationPageName) => {

    this.props.actions.router.goToRoute.trigger({
      route: { daedalus: ROUTES.TRANSFER.DAEDALUS, yoroi: ROUTES.TRANSFER.YOROI }[page],
    });
  }

  render () {
    const { actions, stores } = this.props;
    const { profile } = stores;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;

    return (
      <MainLayout
        topbar={topbarContainer}
        actions={actions}
        stores={stores}
        classicTheme={profile.isClassicTheme}
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
