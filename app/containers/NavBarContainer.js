// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedProps } from '../types/injectedPropsType';
import environment from '../environment';

import { formattedWalletAmount } from '../utils/formatters';
import NavBar from '../components/topbar/NavBar';
import NavPlate from '../components/topbar/NavPlate';
import NavBarTitle from '../components/topbar/NavBarTitle';
import NavWalletDetails from '../components/topbar/NavWalletDetails';

type Props = InjectedProps;

@observer
export default class NavBarContainer extends Component<Props> {

  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  render() {
    const { stores } = this.props;
    const { profile } = stores;

    const walletsStore = stores.substores[environment.API].wallets;
    const publicDeriver = walletsStore.selected;
    const walletName = publicDeriver ? publicDeriver.conceptualWalletName : '';

    // TODO: Change to i18n
    const title = (<NavBarTitle title="My Wallets" />);
    return (
      // TODO: Change to i18n and move up to Wallets.js
      <NavBar
        title={title}
        walletPlate={
          <NavPlate
            publicDeriver={walletsStore.selected}
            walletName={walletName}
            walletType="conceptual"
          />
        }
        walletDetails={
          <NavWalletDetails
            publicDeriver={walletsStore.selected}
            formattedWalletAmount={formattedWalletAmount}
            onUpdateHideBalance={this.updateHideBalance}
            shouldHideBalance={profile.shouldHideBalance}
          />
        }
      />
    );
  }
}
