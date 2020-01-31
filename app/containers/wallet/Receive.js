// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';

@observer
export default class Receive extends Component<InjectedContainerProps> {

  render() {
    return (
      <ReceiveWithNavigation
        isActiveTab={this.props.stores.substores.ada.addresses.isActiveTab}
        onTabClick={this.props.stores.substores.ada.addresses.handleTabClick}
        showMangled={this.props.stores.substores.ada.addresses.mangledAddressesForDisplay.hasAny}
      >
        {this.props.children}
      </ReceiveWithNavigation>
    );
  }
}
