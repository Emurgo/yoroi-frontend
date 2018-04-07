// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import resolver from '../../utils/imports';
import MainLayout from '../MainLayout';
import WalletWithNavigation from '../../components/wallet/layouts/WalletWithNavigation';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';

const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
//const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
/*const WalletTransactionsPage = resolver(
  'containers/wallet/WalletTransactionsPage'
);
const WalletSettingsPage = resolver('containers/wallet/WalletSettingsPage');*/

@inject('stores', 'actions') @observer
export default class Wallet extends Component {
  constructor() {
    super();
    this.state = {
      selected: 'summary'
    };
  }

  handleWalletNavItemClick = tab => {
    this.setState({
      selected: tab
    });
  };

  getChild = stores => {
    switch (this.state.selected) {
      case 'summary':
        return <WalletSummaryPage />;
      case 'send':
        return <WalletSendPage />;
      default:
        return <h1>{this.state.selected}</h1>;
    }
  };

  render() {
    const { actions, stores } = this.props;
    return (
      <MainLayout>
        <WalletWithNavigation
          isActiveScreen={() => true}
          onWalletNavItemClick={this.handleWalletNavItemClick}
        >
          {this.getChild(stores)}
        </WalletWithNavigation>
      </MainLayout>
    );
  }
}
