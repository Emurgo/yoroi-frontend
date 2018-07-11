// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@inject('stores', 'actions') @observer
export default class SupportSettingsPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  handleExternalLinkClick = (event: MouseEvent) => {
    event.preventDefault();
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      window.open(event.target.href, '_blank');
    }
  };

  handleDownloadLogs = () => {
    const destination = remote.dialog.showSaveDialog({
      defaultPath: 'logs.zip',
    });
    if (destination) this.props.actions.profile.downloadLogs.trigger({ destination, fresh: true });
  };

  render() {
    return (
      <SupportSettings
        onExternalLinkClick={this.handleExternalLinkClick}
        onDownloadLogs={this.handleDownloadLogs}
      />
    );
  }

}

