// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import SupportSettings from '../../../components/settings/categories/SupportSettings';
import { downloadLogs } from '../../../utils/logging';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';

type GeneratedData = typeof SupportSettingsPage.prototype.generated;

@observer
export default class SupportSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): {||} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SupportSettingsPage)} no way to generated props`);
    }
    return Object.freeze({
    });
  }

  handleDownloadLogs: (() => void) = () => {
    downloadLogs();
  };

  render(): Node {
    return (
      <SupportSettings
        onExternalLinkClick={handleExternalLinkClick}
        onDownloadLogs={this.handleDownloadLogs}
      />
    );
  }
}
