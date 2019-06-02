// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import ChangeWalletPasswordDialogContainer from './WalletSettingsPage';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  onSelectLanguage = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  selectTheme = (values: { theme: string }) => {
    this.props.actions.profile.updateTheme.trigger(values);
  };

  exportTheme = () => {
    this.props.actions.profile.exportTheme.trigger();
  };

  getThemeVars = (theme: { theme: string }) => (
    this.props.stores.profile.getThemeVars(theme)
  )

  hasCustomTheme = (): boolean => (
    this.props.stores.profile.hasCustomTheme()
  )

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS, currentLocale } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { actions, stores } = this.props;
    const { uiDialogs } = stores;
    const changeDialog = (
      <ChangeWalletPasswordDialogContainer actions={actions} stores={stores} />
    );
    const { currentTheme } = this.props.stores.profile;
    return (
      <div>
        <GeneralSettings
          onSelectLanguage={this.onSelectLanguage}
          isSubmitting={isSubmitting}
          languages={LANGUAGE_OPTIONS}
          currentLocale={currentLocale}
          error={setProfileLocaleRequest.error}
          openDialogAction={actions.dialogs.open.trigger}
          isDialogOpen={uiDialogs.isOpen}
          dialog={changeDialog}
        />
        <ThemeSettingsBlock
          currentTheme={currentTheme}
          selectTheme={this.selectTheme}
          getThemeVars={this.getThemeVars}
          exportTheme={this.exportTheme}
          hasCustomTheme={this.hasCustomTheme}
          onExternalLinkClick={handleExternalLinkClick}
        />
        <AboutYoroiSettingsBlock />
      </div>
    );
  }

}
