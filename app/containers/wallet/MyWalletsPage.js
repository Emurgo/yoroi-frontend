// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import { formattedWalletAmount } from '../../utils/formatters';

import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import MainLayout from '../MainLayout';
import TopBarContainer from '../TopBarContainer';

import WalletsList from '../../components/wallet/my-wallets/WalletsList';
import WalletRow from '../../components/wallet/my-wallets/WalletRow';
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails';

type Props = InjectedProps

@observer
export default class MyWalletsPage extends Component<Props> {

  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  render() {
    const { wallets } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    const walletSumDetails = (
      <WalletDetails
        text="Last sync: 3 hours ago"
        publicDeriver={wallets.selected}
        formattedWalletAmount={formattedWalletAmount}
        // TODO: This should be probably bound to an individual wallet
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    const walletDetails = (
      <WalletDetails
        text="2 addresses"
        publicDeriver={wallets.selected}
        formattedWalletAmount={formattedWalletAmount}
        // TODO: This should be probably bound to an individual wallet
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    // TODO: Map this for all available wallets
    const walletsList = (
      <WalletsList>
        <WalletRow
          walletType="conceptual"
          walletTypeName="Conceptual Wallet"
          publicDeriver={wallets.selected}
          walletSumDetails={walletSumDetails}
          walletDetails={walletDetails}
        />
        <WalletRow
          walletType="paper"
          walletTypeName="Paper Wallet"
          publicDeriver={wallets.selected}
          walletSumDetails={walletSumDetails}
          walletDetails={walletDetails}
        />
        <WalletRow
          walletType="trezor"
          walletTypeName="Trezor Wallet"
          publicDeriver={wallets.selected}
          walletSumDetails={walletSumDetails}
          walletDetails={walletDetails}
        />
      </WalletsList>
    );

    return (
      <MainLayout
        topbar={topbarContainer}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
      >
        {/* TODO: i18n */}
        <MyWallets pageTitle="My wallets">
          {walletsList}
        </MyWallets>
      </MainLayout>
    );
  }
}
