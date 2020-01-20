// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
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

const messages = defineMessages({
  title: {
    id: 'myWallets.general.title',
    defaultMessage: '!!!My wallets',
  },
  conceptualWallet: {
    id: 'myWallets.wallets.conceptual',
    defaultMessage: '!!!Conceptual wallet',
  },
  paperWallet: {
    id: 'myWallets.wallets.paper',
    defaultMessage: '!!!Paper wallet',
  },
  trezorWallet: {
    id: 'myWallets.wallets.trezor',
    defaultMessage: '!!!Trezor wallet',
  },
  lastSyncMessage: {
    id: 'myWallets.wallets.lastSyncText',
    defaultMessage: '!!!Last sync: {hours} ago',
  },
  hoursSingular: {
    id: 'myWallets.wallets.hoursSingular',
    defaultMessage: '!!!hour',
  },
  hoursPlural: {
    id: 'myWallets.wallets.hoursPlural',
    defaultMessage: '!!!hours',
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

  render() {
    const { intl } = this.context;
    const { wallets } = this.props.stores.substores.ada;
    const { actions, stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topbarContainer = (<TopBarContainer actions={actions} stores={stores} />);

    const lastSyncHours = 3;

    const walletSumDetails = (
      <WalletDetails
        text={
          intl.formatMessage(messages.lastSyncMessage, {
            hours: `${lastSyncHours} ${
              intl.formatMessage(lastSyncHours > 1 ?
                messages.hoursPlural : messages.hoursSingular)}`
          })
        }
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
        walletTypeName: intl.formatMessage(messages.conceptualWallet),
      },
      {
        walletType: 'paper',
        walletTypeName: intl.formatMessage(messages.paperWallet),
      },
      {
        walletType: 'trezor',
        walletTypeName: intl.formatMessage(messages.trezorWallet),
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
        showInContainer
      >
        <MyWallets pageTitle={intl.formatMessage(messages.title)}>
          {walletsList}
        </MyWallets>
      </MainLayout>
    );
  }
}
