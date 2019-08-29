// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import ExternalStorageSettings from '../../../components/settings/categories/ExternalStorageSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class ExternalStorageSettingsPage extends Component<InjectedProps> {

  render() {
    return (
      <ExternalStorageSettings
        onExternalLinkClick={handleExternalLinkClick}
      />
    );
  }
}
