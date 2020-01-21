// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import environment from '../../environment';
import type { InjectedProps } from '../../types/injectedPropsType';
import { formattedWalletAmount } from '../../utils/formatters';

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

const messages = defineMessages({
  title: {
    id: 'myWallets.general.title',
    defaultMessage: '!!!My wallets',
  },
  hoursSingular: {
    id: 'myWallets.wallets.hoursSingular',
    defaultMessage: '!!!{time} hour ago',
  },
  hoursPlural: {
    id: 'myWallets.wallets.hoursPlural',
    defaultMessage: '!!!{time} hours ago',
  },
  daysSingular: {
    id: 'myWallets.wallets.daysSingular',
    defaultMessage: '!!!{time} day ago',
  },
  daysPlural: {
    id: 'myWallets.wallets.daysPlural',
    defaultMessage: '!!!{time} days ago',
  },
  minutesSingular: {
    id: 'myWallets.wallets.minutesSingular',
    defaultMessage: '!!!{time} minute ago',
  },
  minutesPlural: {
    id: 'myWallets.wallets.minutesPlural',
    defaultMessage: '!!!{time} minutes ago',
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
    const { wallets } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const sidebarContainer = (<SidebarContainer actions={actions} stores={stores} />);
    const navbarTitle = (
      <NavBarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const navbarElement = (<NavBar title={navbarTitle} />);

    const walletSumDetails = (
      <WalletDetails
        publicDeriver={wallets.selected}
        formattedWalletAmount={formattedWalletAmount}
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
        publicDeriver={wallets.selected}
        formattedWalletAmount={formattedWalletAmount}
        // TODO: This should be probably bound to an individual wallet
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    const walletAddressesComp = (
      <>
        {walletAddresses.map((address) => <WalletAddress hash={address} />)}
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

    const staticWallets = [
      {
        walletType: 'conceptual',
      },
      {
        walletType: 'paper',
      },
      {
        walletType: 'trezor',
      },
    ];

    const walletSubRow = (
      <WalletSubRow
        publicDeriver={wallets.selected}
        walletDetails={walletDetails}
        walletNumber={1}
        walletAddresses={walletAddressesComp}
        walletCurrencies={walletCurrencies}
      />
    );

    // TODO: Map this for all available wallets, not staticWallets
    const walletsList = (
      <WalletsList>
        {
          staticWallets.map((wallet) => {
            return (
              <WalletRow
                onRowClicked={this.handleWalletNavItemClick}
                walletSumDetails={walletSumDetails}
                walletSumCurrencies={walletSumCurrencies}
                walletSubRow={walletSubRow}
                walletPlate={
                  <NavPlate
                    publicDeriver={wallets.selected}
                    walletName={wallets.selected.conceptualWalletName}
                    walletType={wallet.walletType}
                  />
                }
                walletSync={
                  <WalletSync time={intl.formatMessage(messages.hoursPlural, { time: 3 })} />
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
