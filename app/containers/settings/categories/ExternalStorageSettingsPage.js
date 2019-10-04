// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class ExternalStorageSettingsPage extends Component<InjectedProps> {

  onConnect = (authorizeUrl: string) => {
    // Open authorize url
    handleExternalClick(authorizeUrl);
  };

  onDisconnect = () => {
    this.props.actions.memos.unsetExternalStorageProvider.trigger();
  };

  render() {
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
