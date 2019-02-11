// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import DisplaySettings from '../../../components/settings/categories/DisplaySettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class DisplaySettingsPage extends Component<InjectedProps> {

  selectTheme = (values: { theme: string }) => {
    this.props.actions.profile.updateTheme.trigger(values);
  };

  exportTheme = () => {
    this.props.actions.profile.exportTheme.trigger();
  };

  getThemeVars = (theme: { theme: string}) => {
    return this.props.stores.profile.getThemeVars(theme);
  }

  hasCustomTheme = (): boolean => {
    return this.props.stores.profile.hasCustomTheme();
  }

  render() {
    const { currentTheme } = this.props.stores.profile;
    return (
      <DisplaySettings
        theme={currentTheme}
        selectTheme={this.selectTheme}
        getThemeVars={this.getThemeVars}
        exportTheme={this.exportTheme}
        hasCustomTheme={this.hasCustomTheme}
      />
    );
  }

}
