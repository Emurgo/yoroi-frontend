// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import CenteredLayout from '../components/layout/CenteredLayout';
import Loading from '../components/loading/Loading';
import { handleExternalLinkClick } from '../utils/routing';
import { downloadLogs } from '../utils/logging';
import type { ConnectorStoresProps } from '../connector/stores';

@observer
export default class LoadingPage extends Component<ConnectorStoresProps> {

  render(): Node {
    return (
      <CenteredLayout>
        <Loading
          hasLoadedCurrentLocale={this.props.stores.profile.hasLoadedCurrentLocale}
          isLoadingDataForNextScreen={this.props.stores.loading.isLoading}
          error={this.props.stores.loading.error}
          onExternalLinkClick={handleExternalLinkClick}
          downloadLogs={downloadLogs}
        />
      </CenteredLayout>
    );
  }
}
