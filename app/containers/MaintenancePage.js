// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Maintenance from '../components/loading/Maintenance';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';

type GeneratedData = typeof MaintenancePage.prototype.generated;

@observer
export default class MaintenancePage extends Component<InjectedOrGenerated<GeneratedData>> {

  render(): Node {
    return (
      <Maintenance
        onExternalLinkClick={this.generated.handleExternalLinkClick}
      />
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(MaintenancePage)} no way to generated props`);
    }
    return Object.freeze({
      handleExternalLinkClick,
    });
  }
}
