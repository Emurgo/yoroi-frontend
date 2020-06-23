// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import environment from '../../../environment';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import LocalizableError from '../../../i18n/LocalizableError';
import type { LanguageType } from '../../../i18n/translations';
import type { Theme } from '../../../themes';

type GeneratedData = typeof GeneralSettingsPage.prototype.generated;

@observer
export default class GeneralSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {

  render(): Node {
    const profileStore = this.generated.stores.profile;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;
    const { currentTheme } = profileStore;

    return (
      <>
        <GeneralSettings
          onSelectLanguage={this.generated.actions.profile.updateLocale.trigger}
          isSubmitting={isSubmittingLocale}
          languages={profileStore.LANGUAGE_OPTIONS}
          currentLocale={profileStore.currentLocale}
          error={profileStore.setProfileLocaleRequest.error}
        />
        {!environment.isJormungandr() &&
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

  @computed get generated(): {|
    actions: {|
      profile: {|
        exportTheme: {|
          trigger: (params: void) => Promise<void>
        |},
        updateLocale: {|
          trigger: (params: {|
            locale: string
          |}) => Promise<void>
        |},
        updateTheme: {|
          trigger: (params: {|
            theme: string
          |}) => Promise<void>
        |}
      |}
    |},
    stores: {|
      profile: {|
        LANGUAGE_OPTIONS: Array<LanguageType>,
        currentLocale: string,
        currentTheme: Theme,
        getThemeVars: ({| theme: string |}) => {
          [key: string]: string,
          ...
        },
        hasCustomTheme: void => boolean,
        setProfileLocaleRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |}
      |}
    |}
    |} {
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
          setProfileLocaleRequest: {
            isExecuting: profileStore.setProfileLocaleRequest.isExecuting,
            error: profileStore.setProfileLocaleRequest.error,
          },
          LANGUAGE_OPTIONS: profileStore.LANGUAGE_OPTIONS,
          currentLocale: profileStore.currentLocale,
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
        },
      },
    });
  }
}
