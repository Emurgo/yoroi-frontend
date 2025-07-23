// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { StoresProps } from '../../../stores';

@observer
export default class ExternalStorageSettingsPage extends Component<StoresProps> {

  onConnect: string => void = (authorizeUrl) => {
    // Open authorize url
    handleExternalClick(authorizeUrl);
  };

  onDisconnect: void => Promise<void> = async () => {
    await this.props.stores.memos.unsetExternalStorageProvider();
  };

  render(): Node {
    const {
      providers,
      selectedProvider
    } = this.props.stores.memos;

    return (
      <ExternalStorageSettings
        onConnect={this.onConnect}
        onDisconnect={this.onDisconnect}
        externalStorageProviders={providers}
        selectedExternalStorage={selectedProvider}
      />
    );
  }
}
