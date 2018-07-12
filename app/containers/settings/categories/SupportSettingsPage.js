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
    if (target instanceof HTMLAnchorElement) {
      window.open(target.href, '_blank');
    }
  };

  render() {
    return (
      <SupportSettings
        onExternalLinkClick={this.handleExternalLinkClick}
      />
    );
  }

}

