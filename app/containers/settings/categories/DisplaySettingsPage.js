// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import DisplaySettings from '../../../components/settings/categories/DisplaySettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import type { Themes } from '../../../types/ThemeType';

@observer
export default class DisplaySettingsPage extends Component<InjectedProps> {

  selectTheme = (values: { theme: Themes }) => {
    this.props.actions.profile.updateTheme.trigger(values);
  };

  exportTheme = () => {
    this.props.actions.profile.exportTheme.trigger();
  };

  getThemeVars = (theme: { theme: Themes}) => (
    this.props.stores.profile.getThemeVars(theme)
  )

  hasCustomTheme = (): boolean => (
    this.props.stores.profile.hasCustomTheme()
  )

  render() {
    const { currentTheme, isClassicThemeActive } = this.props.stores.profile;
    return (
      <DisplaySettings
        theme={currentTheme}
        selectTheme={this.selectTheme}
        getThemeVars={this.getThemeVars}
        exportTheme={this.exportTheme}
        hasCustomTheme={this.hasCustomTheme}
        onExternalLinkClick={handleExternalLinkClick}
        isClassicThemeActive={isClassicThemeActive}
      />
    );
  }

}
