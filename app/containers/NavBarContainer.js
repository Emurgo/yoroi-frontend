// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../types/injectedPropsType';
import environment from '../environment';
import { intlShape, defineMessages } from 'react-intl';
import { formattedWalletAmount } from '../utils/formatters';
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

    // TODO: Replace route with ROUTES.WALLETS.ROOT after merging MyWallets screen
    const title = (
      <NavBarBack
        route={ROUTES.SETTINGS.ROOT}
        onBackClick={this.navigateToWallets}
        title={intl.formatMessage(messages.backButton)}
      />
    );

    const plateComponent = (
      <NavPlate
        publicDeriver={walletsStore.selected}
        walletName={walletName}
        walletType="conceptual"
      />
    );

    const dropdownHead = (
      <NavWalletDetails
        publicDeriver={walletsStore.selected}
        formattedWalletAmount={formattedWalletAmount}
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
      />
    );

    const dropdownContent = (
      <>
        <NavDropdownRow
          title="All wallets"
          detailComponent={
            <NavWalletDetails
              publicDeriver={walletsStore.selected}
              formattedWalletAmount={formattedWalletAmount}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              highlightTitle
            />
          }
        />
        <NavDropdownRow
          plateComponent={plateComponent}
          isCurrentWallet
          syncTime="5 min ago"
          detailComponent={
            <NavWalletDetails
              publicDeriver={walletsStore.selected}
              formattedWalletAmount={formattedWalletAmount}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
            />
          }
        />
        <NavDropdownRow
          plateComponent={plateComponent}
          syncTime="2 hours ago"
          detailComponent={
            <NavWalletDetails
              publicDeriver={walletsStore.selected}
              formattedWalletAmount={formattedWalletAmount}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
            />
          }
        />
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
            walletType="paper"
          />
        }
        walletDetails={dropdownComponent}
      />
    );
  }
}
