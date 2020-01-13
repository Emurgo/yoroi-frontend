// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import { getExplorers } from '../../../domain/Explorer';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {


  render() {
    const {
      setSelectedExplorerRequest,
      setProfileLocaleRequest,
      LANGUAGE_OPTIONS,
      currentLocale,
      selectedExplorer,
    } = this.props.stores.profile;
    const isSubmittingLocale = setProfileLocaleRequest.isExecuting;
    const isSubmittingExplorer = setSelectedExplorerRequest.isExecuting;
    const explorerOptions = getExplorers();
    const { currentTheme } = this.props.stores.profile;

    // disable for Shelley to avoid overriding mainnet Yoroi URI
    const uriSettings = environment.userAgentInfo.canRegisterProtocol() && !environment.isShelley()
      ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox}
        />
      )
      : null;

    return (
      <div>
        <GeneralSettings
          onSelectLanguage={this.props.actions.profile.updateLocale.trigger}
          isSubmitting={isSubmittingLocale}
          languages={LANGUAGE_OPTIONS}
          currentLocale={currentLocale}
          error={setProfileLocaleRequest.error}
        />
        <ExplorerSettings
          onSelectExplorer={this.props.actions.profile.updateSelectedExplorer.trigger}
          isSubmitting={isSubmittingExplorer}
          explorers={explorerOptions}
          selectedExplorer={selectedExplorer}
          error={setSelectedExplorerRequest.error}
        />
        {uriSettings}
        {!environment.isShelley() &&
          <ThemeSettingsBlock
            currentTheme={currentTheme}
            selectTheme={this.props.actions.profile.updateTheme.trigger}
            getThemeVars={this.props.stores.profile.getThemeVars}
            exportTheme={this.props.actions.profile.exportTheme.trigger}
            hasCustomTheme={this.props.stores.profile.hasCustomTheme}
            onExternalLinkClick={handleExternalLinkClick}
          />
        }
        <AboutYoroiSettingsBlock />
      </div>
    );
  }

}
