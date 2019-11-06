// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TopBar from '../components/topbar/TopBar';
import WalletTopbarTitle from '../components/topbar/WalletTopbarTitle';
import type { InjectedProps } from '../types/injectedPropsType';
import { matchRoute } from '../utils/routing';
import { ROUTES } from '../routes-config';
import environment from '../environment';

import { formattedWalletAmount } from '../utils/formatters';

type Props = InjectedProps;

@observer
export default class TopBarContainer extends Component<Props> {

  updateHideBalance = () => {
    this.props.actions.profile.updateHideBalance.trigger();
  }

  render() {
    const { actions, stores } = this.props;
    const { app, topbar, profile } = stores;
    const walletsStore = stores.substores[environment.API].wallets;

    let testRoute: string = '';
    if (environment.isShelley()) {
      testRoute = `${ROUTES.STAKING.ROOT}/:id(*page)`;
    } else {
      testRoute = `${ROUTES.WALLETS.ROOT}/:id(*page)`;
    }

    // If we are looking at a wallet/staking, show its name and balance
    const matchedRoute = matchRoute(testRoute, app.currentRoute);
    const showWalletInfo = (matchedRoute !== false) && (walletsStore.selected != null);

    const title = (<WalletTopbarTitle
      publicDeriver={walletsStore.selected}
      formattedWalletAmount={formattedWalletAmount}
      themeProperties={{
        identiconSaturationFactor: profile.isClassicTheme ? -5 : 0
      }}
      onUpdateHideBalance={this.updateHideBalance}
      shouldHideBalance={profile.shouldHideBalance}
      showWalletInfo={showWalletInfo}
    />);
    return (
      <TopBar
        title={title}
        onCategoryClicked={category => {
          actions.topbar.activateTopbarCategory.trigger({ category });
        }}
        isActiveCategory={topbar.isActiveCategory}
        categories={topbar.categories}
      />
    );
  }
}
