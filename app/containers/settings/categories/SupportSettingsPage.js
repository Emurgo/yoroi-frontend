// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import type { InjectedProps } from '../../../types/injectedPropsType';

@inject('stores', 'actions') @observer
export default class SupportSettingsPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  handleDownloadLogs = () => {
    downloadLogs();
  };

  render() {
    return (
      <SupportSettings
        onExternalLinkClick={handleExternalLinkClick}
        onDownloadLogs={this.handleDownloadLogs}
      />
    );
  }
}
