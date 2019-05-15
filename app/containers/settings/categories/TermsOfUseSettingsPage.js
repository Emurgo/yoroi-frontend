// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class TermsOfUseSettingsPage extends Component<InjectedProps> {

  render() {
    const { termsOfUse } = this.props.stores.profile;
    return (
      <TermsOfUseSettings
        localizedTermsOfUse={termsOfUse}
      />
    );
  }

}
