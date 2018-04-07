// @flow
import React, { Component } from 'react';
import MainLayout from '../MainLayout';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';

export default class Wallet extends Component {
  render() {
    const { actions } = this.props;
    return (
      <MainLayout>
        <WalletWithNavigation
          isActiveScreen={() => true}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.props.children}
        </WalletWithNavigation>
      </MainLayout>
    );
  }
}
