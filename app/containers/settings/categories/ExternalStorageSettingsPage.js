// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class ExternalStorageSettingsPage extends Component<InjectedProps> {

  render() {
    const {
      providers,
      selectedProvider
    } = this.props.stores.memos;

    return (
      <ExternalStorageSettings
        onExternalClick={handleExternalClick}
        externalStorageProviders={providers}
        selectedExternalStorage={selectedProvider}
      />
    );
  }
}
