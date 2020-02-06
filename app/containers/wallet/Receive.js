// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedContainerProps } from '../../types/injectedPropsType';
import ReceiveWithNavigation from '../../components/wallet/layouts/ReceiveWithNavigation';

@observer
export default class Receive extends Component<InjectedContainerProps> {

  render() {
    const publicDeriver = this.props.stores.substores.ada.wallets.selected;
    if (publicDeriver == null) throw new Error(`${nameof(Receive)} no public deriver`);

    return (
      <ReceiveWithNavigation
        isActiveTab={(tab) => this.props.stores.substores.ada.addresses.isActiveTab(
          tab,
          publicDeriver
        )}
        onTabClick={(page) => this.props.stores.substores.ada.addresses.handleTabClick(
          page,
          publicDeriver
        )}
        showMangled={this.props.stores.substores.ada.addresses.mangledAddressesForDisplay.hasAny}
      >
        {this.props.children}
      </ReceiveWithNavigation>
    );
  }
}
