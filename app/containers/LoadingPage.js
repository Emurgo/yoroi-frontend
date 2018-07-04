// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import CenteredLayout from '../components/layout/CenteredLayout';
import Loading from '../components/loading/Loading';
import adaLogo from '../assets/images/ada-logo.inline.svg';
import cardanoLogo from '../assets/images/cardano-logo.inline.svg';
import type { InjectedProps } from '../types/injectedPropsType';

export const messages = defineMessages({
  loadingWalletData: {
    id: 'loading.screen.loadingWalletData',
    defaultMessage: '!!!Loading wallet data',
    description: 'Message "Loading wallet data" on the loading screen.'
  },
});

@inject('stores', 'actions') @observer
export default class LoadingPage extends Component<InjectedProps> {

  render() {
    /* const { stores } = this.props;
    const { app } = stores;
    const { wallets } = stores[environment.API];
    if (app.currentRoute === ROUTES.ROOT) {
      if (wallets.first) {
        actions.router.goToRoute.trigger({
          route: ROUTES.WALLETS.SUMMARY,
          params: { id: wallets.first.id }
        });
      } else {
        actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.ADD });
      }
    }*/

    const { hasLoadedCurrentLocale, hasLoadedCurrentTheme } = {
      hasLoadedCurrentLocale: true,
      hasLoadedCurrentTheme: true,
    };
    return (
      <CenteredLayout>
        <Loading
          currencyIcon={adaLogo}
          apiIcon={cardanoLogo}
          hasLoadedCurrentLocale={hasLoadedCurrentLocale}
          hasLoadedCurrentTheme={hasLoadedCurrentTheme}
          isLoadingDataForNextScreen={true}
          loadingDataForNextScreenMessage={messages.loadingWalletData}
        />
      </CenteredLayout>
    );
  }
}
