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
  loadingLibraries: {
    id: 'loading.screen.loadingLibraries',
    defaultMessage: '!!!Loading libraries',
    description: 'Message "Loading libraries" on the loading screen.'
  },
});

@inject('stores', 'actions') @observer
export default class LoadingPage extends Component<InjectedProps> {

  render() {
    const { stores } = this.props;
    const { libs } = stores;
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
          isLoadingDataForNextScreen={libs.loading}
          loadingDataForNextScreenMessage={messages.loadingLibraries}
        />
      </CenteredLayout>
    );
  }
}
