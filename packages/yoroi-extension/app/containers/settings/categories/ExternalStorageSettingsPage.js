// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';

@observer
export default class ExternalStorageSettingsPage extends Component<StoresAndActionsProps> {

  onConnect: string => void = (authorizeUrl) => {
    // Open authorize url
    handleExternalClick(authorizeUrl);
  };

  onDisconnect: void => Promise<void> = async () => {
    await this.props.actions.memos.unsetExternalStorageProvider.trigger();
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
