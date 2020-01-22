// @flow
import moment from 'moment';
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../types/injectedPropsType';
import environment from '../environment';
import { intlShape, defineMessages } from 'react-intl';
import NavBar from '../components/topbar/NavBar';
import NavPlate from '../components/topbar/NavPlate';
import NavWalletDetails from '../components/topbar/NavWalletDetails';
import NavDropdown from '../components/topbar/NavDropdown';
import NavDropdownRow from '../components/topbar/NavDropdownRow';
import NavBarBack from '../components/topbar/NavBarBack';
import { ROUTES } from '../routes-config';

const messages = defineMessages({
  backButton: {
    id: 'wallet.nav.backButton',
    defaultMessage: '!!!Back to my wallets',
  },
  allWalletsLabel: {
    id: 'wallet.nav.allWalletsLabel',
    defaultMessage: '!!!All wallets',
  },
});

type Props = InjectedProps;

@observer
export default class NavBarContainer extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };


  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  navigateToWallets = (destination: string) => {
    this.props.actions.router.goToRoute.trigger({ route: destination });
  }

  render() {
    const { intl } = this.context;
    const { stores } = this.props;
    const { profile } = stores;

    const walletsStore = stores.substores[environment.API].wallets;
    const publicDeriver = walletsStore.selected;
    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';
    const walletAmount = new BigNumber(0);

    // TODO: Replace route with ROUTES.WALLETS.ROOT after merging MyWallets screen
    const title = (
      <NavBarBack
        route={ROUTES.SETTINGS.ROOT}
        onBackClick={this.navigateToWallets}
        title={intl.formatMessage(messages.backButton)}
      />
    );

    const wallets = this.props.stores.substores.ada.wallets.publicDerivers;

    let utxoTotal = new BigNumber(0);
    for (const walletUtxoAmount of wallets.map(wallet => wallet.amount)) {
      if (walletUtxoAmount == null) {
        utxoTotal = null;
        break;
      }
      utxoTotal = utxoTotal.plus(walletUtxoAmount);
    }
    const dropdownHead = (
      <NavWalletDetails
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
        rewards={new BigNumber(5)}
        walletAmount={utxoTotal}
      />
    );

    const walletComponents = wallets.map(wallet => (
      <NavDropdownRow
        key={wallet.self.getPublicDeriverId()}
        plateComponent={<NavPlate
          publicDeriver={wallet}
          walletName={wallet.conceptualWalletName}
          walletType="standard"
        />}
        isCurrentWallet={wallet === this.props.stores.substores.ada.wallets.selected}
        syncTime={wallet.lastSyncInfo.Time
          ? moment(wallet.lastSyncInfo.Time).fromNow()
          : null
        }
        detailComponent={
          <NavWalletDetails
            walletAmount={walletAmount}
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
            rewards={new BigNumber('565.000000') /* TODO */}
          />
        }
      />
    ));
    const dropdownContent = (
      <>
        <NavDropdownRow
          title={intl.formatMessage(messages.allWalletsLabel)}
          detailComponent={
            <NavWalletDetails
              highlightTitle
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards={new BigNumber(5)}
              walletAmount={utxoTotal}
            />
          }
        />
        {walletComponents}
      </>
    );

    const dropdownComponent = (
      <NavDropdown
        headerComponent={dropdownHead}
        contentComponents={dropdownContent}
      />
    );

    return (
      <NavBar
        title={title}
        walletPlate={
          <NavPlate
            publicDeriver={walletsStore.selected}
            walletName={walletName}
            walletType="standard"
          />
        }
        walletDetails={dropdownComponent}
      />
    );
  }
}
