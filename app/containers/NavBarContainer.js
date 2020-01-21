// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
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

  getWalletAmount: (null | BigNumber) => null | string = (amount) => {
    const { profile } = this.props.stores;

    if (amount == null) return null;
    return profile.shouldHideBalance
      ? '******'
      : formattedWalletAmount(amount);
  }

  render() {
    const { intl } = this.context;
    const { stores } = this.props;
    const { profile } = stores;

    const walletsStore = stores.substores[environment.API].wallets;
    const publicDeriver = walletsStore.selected;
    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';
    const walletAmount = publicDeriver
      ? this.getWalletAmount(publicDeriver.amount)
      : null;

    const title = (
      <NavBarBack
        route={ROUTES.MY_WALLETS}
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
        onUpdateHideBalance={this.updateHideBalance}
        shouldHideBalance={profile.shouldHideBalance}
        rewards="2,565.000000"
        walletAmount={walletAmount}
      />
    );

    const dropdownContent = (
      <>
        <NavDropdownRow
          title="All wallets"
          detailComponent={
            <NavWalletDetails
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              walletAmount={walletAmount}
              highlightTitle
              rewards="565.000000"
            />
          }
        />
        <NavDropdownRow
          plateComponent={plateComponent}
          isCurrentWallet
          syncTime="5 min ago"
          detailComponent={
            <NavWalletDetails
              walletAmount={walletAmount}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards="1,472.000000"
            />
          }
        />
        <NavDropdownRow
          plateComponent={plateComponent}
          syncTime="2 hours ago"
          detailComponent={
            <NavWalletDetails
              walletAmount={walletAmount}
              onUpdateHideBalance={this.updateHideBalance}
              shouldHideBalance={profile.shouldHideBalance}
              rewards="3,211.999811"
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
