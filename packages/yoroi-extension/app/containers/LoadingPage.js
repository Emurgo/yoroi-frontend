// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import CenteredLayout from '../components/layout/CenteredLayout';
import Loading from '../components/loading/Loading';
import type { JointStoresAndActionsProps } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';
import { downloadLogs } from '../utils/logging';

@observer
export default class LoadingPage extends Component<JointStoresAndActionsProps> {

  render(): Node {
    return (
      <CenteredLayout>
        <Loading
          hasLoadedCurrentLocale={this.props.stores.profile.hasLoadedCurrentLocale}
          hasLoadedCurrentTheme={this.props.stores.profile.hasLoadedCurrentTheme}
          isLoadingDataForNextScreen={this.props.stores.loading.isLoading}
          error={this.props.stores.loading.error}
          onExternalLinkClick={handleExternalLinkClick}
          downloadLogs={downloadLogs}
        />
      </CenteredLayout>
    );
  }
}
