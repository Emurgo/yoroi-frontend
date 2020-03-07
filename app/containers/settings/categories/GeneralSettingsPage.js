// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import ExplorerSettings from '../../../components/settings/categories/general-setting/ExplorerSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import UriSettingsBlock from '../../../components/settings/categories/general-setting/UriSettingsBlock';
import registerProtocols from '../../../uri-protocols';
import environment from '../../../environment';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import { getExplorers } from '../../../domain/Explorer';
import ProfleActions from '../../../actions/profile-actions';
import type { LanguageType } from '../../../i18n/translations';
import type { ExplorerType } from '../../../domain/Explorer';
import LocalizableError from '../../../i18n/LocalizableError';
import type { Theme } from '../../../themes';

type GeneratedData = {|
  +stores: {|
    +profile: {|
      +setSelectedExplorerRequest: {|
        +isExecuting: boolean,
        +error: ?LocalizableError,
      |},
      +setProfileLocaleRequest: {|
        +isExecuting: boolean,
        +error: ?LocalizableError,
      |},
      +LANGUAGE_OPTIONS: Array<LanguageType>,
      +currentLocale: string,
      +selectedExplorer: ExplorerType,
      +currentTheme: Theme,
      +getThemeVars: {| theme: string |} => { [key: string]: string, ... },
      +hasCustomTheme: void => boolean,
    |},
  |},
  +actions: {|
    +profile: {|
      +updateLocale: {|
        +trigger: typeof ProfleActions.prototype.updateLocale.trigger
      |},
      +updateTheme: {|
        +trigger: typeof ProfleActions.prototype.updateTheme.trigger
      |},
      +exportTheme: {|
        +trigger: typeof ProfleActions.prototype.exportTheme.trigger
      |},
      +updateSelectedExplorer: {|
        +trigger: typeof ProfleActions.prototype.updateSelectedExplorer.trigger
      |},
    |},
  |},
  +canRegisterProtocol: void => boolean,
|};

@observer
export default class GeneralSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  @computed get generated(): GeneratedData {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(GeneralSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          setSelectedExplorerRequest: {
            isExecuting: profileStore.setSelectedExplorerRequest.isExecuting,
            error: profileStore.setSelectedExplorerRequest.error,
          },
          setProfileLocaleRequest: {
            isExecuting: profileStore.setProfileLocaleRequest.isExecuting,
            error: profileStore.setProfileLocaleRequest.error,
          },
          LANGUAGE_OPTIONS: profileStore.LANGUAGE_OPTIONS,
          currentLocale: profileStore.currentLocale,
          selectedExplorer: profileStore.selectedExplorer,
          currentTheme: profileStore.currentTheme,
          getThemeVars: profileStore.getThemeVars,
          hasCustomTheme: profileStore.hasCustomTheme,
        },
      },
      actions: {
        profile: {
          updateLocale: { trigger: actions.profile.updateLocale.trigger },
          updateTheme: { trigger: actions.profile.updateTheme.trigger },
          exportTheme: { trigger: actions.profile.exportTheme.trigger },
          updateSelectedExplorer: { trigger: actions.profile.updateSelectedExplorer.trigger },
        },
      },
      canRegisterProtocol: environment.userAgentInfo.canRegisterProtocol,
    });
  }

  render() {
    const profileStore = this.generated.stores.profile;
    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;
    const isSubmittingExplorer = profileStore.setSelectedExplorerRequest.isExecuting;
    const explorerOptions = getExplorers();
    const { currentTheme } = profileStore;

    // disable for Shelley to avoid overriding mainnet Yoroi URI
    const uriSettings = !environment.isShelley() && this.generated.canRegisterProtocol()
      ? (
        <UriSettingsBlock
          registerUriScheme={() => registerProtocols()}
          isFirefox={environment.userAgentInfo.isFirefox}
        />
      )
      : null;

    return (
      <>
        <GeneralSettings
          onSelectLanguage={this.generated.actions.profile.updateLocale.trigger}
          isSubmitting={isSubmittingLocale}
          languages={profileStore.LANGUAGE_OPTIONS}
          currentLocale={profileStore.currentLocale}
          error={profileStore.setProfileLocaleRequest.error}
        />
        <ExplorerSettings
          onSelectExplorer={this.generated.actions.profile.updateSelectedExplorer.trigger}
          isSubmitting={isSubmittingExplorer}
          explorers={explorerOptions}
          selectedExplorer={profileStore.selectedExplorer}
          error={profileStore.setSelectedExplorerRequest.error}
        />
        {uriSettings}
        {!environment.isShelley() &&
          <ThemeSettingsBlock
            currentTheme={currentTheme}
            selectTheme={this.generated.actions.profile.updateTheme.trigger}
            getThemeVars={this.generated.stores.profile.getThemeVars}
            exportTheme={this.generated.actions.profile.exportTheme.trigger}
            hasCustomTheme={this.generated.stores.profile.hasCustomTheme}
            onExternalLinkClick={handleExternalLinkClick}
          />
        }
        <AboutYoroiSettingsBlock />
      </>
    );
  }

}
