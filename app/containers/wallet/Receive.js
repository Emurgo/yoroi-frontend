// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import { ROUTES } from '../../routes-config';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';
import { buildRoute } from '../../utils/routing';

const RECEIVE_ROUTES = {
  internal: ROUTES.WALLETS.RECEIVE.INTERNAL,
  external: ROUTES.WALLETS.RECEIVE.EXTERNAL
};

@observer
export default class Receive extends Component<InjectedContainerProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  isActiveScreen = (page: string, subpage: string): boolean => {
    const { app } = this.props.stores;
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return false;
    const screenRoute = buildRoute(
      RECEIVE_ROUTES[page],
      {
        id: selected.self.getPublicDeriverId(),
        page
      }
    );
    if (subpage !== undefined) {
      return app.currentRoute.indexOf(screenRoute) !== -1;
    }
    return app.currentRoute === screenRoute;
  };

  handleTabClick = (page: string): void => {
    const { wallets } = this.props.stores.substores.ada;
    const selected = wallets.selected;
    if (selected == null) return;
    this.props.actions.router.goToRoute.trigger({
      route: RECEIVE_ROUTES[page],
      params: { id: selected.self.getPublicDeriverId(), page },
    });
  };

  render() {
    return (
      <ReceiveWithNavigation
        isActiveTab={this.isActiveScreen}
        onTabClick={this.handleTabClick}
      >
        {this.props.children}
      </ReceiveWithNavigation>
    );
  }
}
