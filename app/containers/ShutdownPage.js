// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import Shutdown from '../components/loading/Shutdown';
import type { InjectedOrGenerated } from '../types/injectedPropsType';
import { handleExternalLinkClick } from '../utils/routing';

type GeneratedData = typeof ShutdownPage.prototype.generated;

@observer
export default class ShutdownPage extends Component<InjectedOrGenerated<GeneratedData>> {

  render() {
    return (
      <Shutdown
        onExternalLinkClick={this.generated.handleExternalLinkClick}
      />
    );
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(ShutdownPage)} no way to generated props`);
    }
    return Object.freeze({
      handleExternalLinkClick,
    });
  }
}
