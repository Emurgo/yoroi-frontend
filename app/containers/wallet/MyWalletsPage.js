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
import WalletAddress from '../../components/wallet/my-wallets/WalletAddress';
import WalletCurrency from '../../components/wallet/my-wallets/WalletCurrency';
import WalletSubRow from '../../components/wallet/my-wallets/WalletSubRow';

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

    const walletAddresses = (
      <>
        <WalletAddress hash="Ae45dPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nbdf4u3" />
        <WalletAddress hash="Ae2tdPwUPEZMen5UdmKCeiNqCooMVBpDQbmhM1dtFSFigvbvDTZdF4nmt4s7" />
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
        walletTypeName: 'Conceptual Wallet'
      },
      {
        walletType: 'paper',
        walletTypeName: 'Paper Wallet'
      },
      {
        walletType: 'trezor',
        walletTypeName: 'Trezor Wallet'
      },
    ];

    const walletSubRow = (
      <WalletSubRow
        publicDeriver={wallets.selected}
        walletDetails={walletDetails}
        walletNumber={1}
        walletAddresses={walletAddresses}
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
                walletType={wallet.walletType}
                walletTypeName={wallet.walletTypeName}
                walletSumDetails={walletSumDetails}
                walletSumCurrencies={walletSumCurrencies}
                walletSubRow={walletSubRow}
              />
            );
          })
        }
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
