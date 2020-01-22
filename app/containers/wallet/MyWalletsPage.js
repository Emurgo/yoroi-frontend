// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';

import MyWallets from '../../components/wallet/my-wallets/MyWallets';
import MainLayout from '../MainLayout';

import WalletsList from '../../components/wallet/my-wallets/WalletsList';
import WalletRow from '../../components/wallet/my-wallets/WalletRow';
import WalletDetails from '../../components/wallet/my-wallets/WalletDetails';
import WalletAddress from '../../components/wallet/my-wallets/WalletAddress';
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency';
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow';
import NavPlate from '../../components/topbar/NavPlate';
import SidebarContainer from '../SidebarContainer';
import { ROUTES } from '../../routes-config';
import NavBar from '../../components/topbar/NavBar';
import NavBarTitle from '../../components/topbar/NavBarTitle';
import WalletSync from '../../components/wallet/my-wallets/WalletSync';
import BigNumber from 'bignumber.js';
import moment from 'moment';

const messages = defineMessages({
  title: {
    id: 'myWallets.general.title',
    defaultMessage: '!!!My wallets',
  },
  addressSingular: {
    id: 'myWallets.wallets.addressSingular',
    defaultMessage: '!!!address',
  },
  addressPlural: {
    id: 'myWallets.wallets.addressPlural',
    defaultMessage: '!!!addresses',
  },
});

type Props = InjectedProps

@observer
export default class MyWalletsPage extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

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
    const { intl } = this.context;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);

    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(messages.title)} />
    );

    const navbarElement = (<NavBar title={navbarTitle} />);

    const walletsStore = stores.substores[environment.API].wallets;
    const publicDeriver = walletsStore.selected;
    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';

    const walletAmount = new BigNumber(12);

    const wallets = this.props.stores.substores.ada.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    for (const walletUtxoAmount of wallets.map(wallet => wallet.amount)) {
      if (walletUtxoAmount == null) {
        utxoTotal = null;
        break;
      }
      utxoTotal = utxoTotal.plus(walletUtxoAmount);
    }

    const walletSumDetails = (
      <WalletDetails
        walletAmount={walletAmount}
        rewards={new BigNumber('565.000000') /* TODO */}
        // TODO: This should be probably bound to an individual wallet
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    const walletAddresses = [
      'Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3',
      'Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7'
    ];

    const addressesLength = walletAddresses.length;

    const walletDetails = (
      <WalletDetails
        text={
          `${addressesLength} ${
            intl.formatMessage(addressesLength > 1 ?
              messages.addressPlural : messages.addressSingular)}`
        }
        // TODO: This should be probably bound to an individual wallet
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    const walletAddressesComp = (
      <>
        {walletAddresses.map((address) => <WalletAddress key={address} hash={address} />)}
      </>
    );

    const walletSumCurrencies = (
      <>
        <WalletCurrency
          currency="ADA"
          tooltipText="1.320"
        />
        <WalletCurrency
          currency="BTC"
          tooltipText="0.060"
        />
        <WalletCurrency
          currency="ETH"
          tooltipText="3.132"
        />
      </>
    );

    const walletCurrencies = (
      <>
        <WalletCurrency
          currency="ADA"
          tooltipText="0.060"
        />
        <WalletCurrency
          currency="BTC"
          tooltipText="0.060"
        />
        <WalletCurrency
          currency="ETH"
          tooltipText="0.060"
        />
      </>
    );

    const walletSubRow = (
      <WalletSubRow
        publicDeriver={walletsStore.selected}
        walletDetails={walletDetails}
        walletNumber={1}
        walletAddresses={walletAddressesComp}
        walletCurrencies={walletCurrencies}
      />
    );

    const walletsList = (
      <WalletsList>
        {
          wallets.map((wallet) => {
            return (
              <WalletRow
                key={wallet.self.getPublicDeriverId()}
                onRowClicked={this.handleWalletNavItemClick}
                walletSumDetails={walletSumDetails}
                walletSumCurrencies={walletSumCurrencies}
                walletSubRow={walletSubRow}
                walletPlate={
                  <NavPlate
                    publicDeriver={walletsStore.selected}
                    walletName={walletName}
                    walletType="conceptual"
                  />
                }
                walletSync={
                  <WalletSync
                    time={
                      wallet.lastSyncInfo.Time
                        ? moment(wallet.lastSyncInfo.Time).fromNow()
                        : null
                    }
                  />
                }
              />
            );
          })
        }
      </WalletsList>
    );

    return (
      <MainLayout
        sidebar={sidebarContainer}
        navbar={navbarElement}
        actions={actions}
        stores={stores}
        connectionErrorType={checkAdaServerStatus}
        showInContainer
      >
        <MyWallets pageTitle={intl.formatMessage(messages.title)}>
          {walletsList}
        </MyWallets>
      </MainLayout>
    );
  }
}
