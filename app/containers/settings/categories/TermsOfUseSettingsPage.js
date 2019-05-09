// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import TermsOfUseSettings from '../../../components/settings/categories/TermsOfUseSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import { THEMES } from '../../../themes';

@observer
export default class TermsOfUseSettingsPage extends Component<InjectedProps> {

  render() {
    const { termsOfUse, currentTheme } = this.props.stores.profile;
    return (
      <TermsOfUseSettings
        localizedTermsOfUse={termsOfUse}
        classicTheme={currentTheme === THEMES.YOROI_CLASSIC}
      />
    );
  }

}
