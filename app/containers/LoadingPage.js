// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import environment from '../environment';
import CenteredLayout from '../components/layout/CenteredLayout';
import Loading from '../components/loading/Loading';
import type { InjectedProps } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';
import { downloadLogs } from '../utils/logging';

@observer
export default class LoadingPage extends Component<InjectedProps> {
  render() {
    const { stores } = this.props;
    const { loading } = stores;
    const { hasLoadedCurrentLocale, hasLoadedCurrentTheme } = stores.profile;
    return (
      <CenteredLayout>
        <Loading
          api={environment.API}
          hasLoadedCurrentLocale={hasLoadedCurrentLocale}
          hasLoadedCurrentTheme={hasLoadedCurrentTheme}
          isLoadingDataForNextScreen={loading.isLoading}
          error={loading.error}
          onExternalLinkClick={handleExternalLinkClick}
          downloadLogs={downloadLogs}
        />
      </CenteredLayout>
    );
  }
}
