// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class SupportSettingsPage extends Component<InjectedProps> {

  handleDownloadLogs = () => {
    downloadLogs();
  };

  render() {
    const { profile } = this.props.stores;
    return (
      <SupportSettings
        onExternalLinkClick={handleExternalLinkClick}
        onDownloadLogs={this.handleDownloadLogs}
        theme={profile.currentTheme}
      />
    );
  }
}
