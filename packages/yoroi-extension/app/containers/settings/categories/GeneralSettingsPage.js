// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { handleExternalLinkClick } from '../../../utils/routing';
import GeneralSettings from '../../../components/settings/categories/general-setting/GeneralSettings';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import ThemeSettingsBlock from '../../../components/settings/categories/general-setting/ThemeSettingsBlock';
import AboutYoroiSettingsBlock from '../../../components/settings/categories/general-setting/AboutYoroiSettingsBlock';
import LocalizableError from '../../../i18n/LocalizableError';
import type { LanguageType } from '../../../i18n/translations';
import type { Theme } from '../../../styles/utils';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';

type GeneratedData = typeof GeneralSettingsPage.prototype.generated;

@observer
export default class GeneralSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {
  switchWallet: (PublicDeriver<>) => void = publicDeriver => {
    this.generated.actions.router.goToRoute.trigger({
      route: this.generated.stores.app.currentRoute,
      publicDeriver,
    });
  };

  handleSwitchToFirstWallet: void => void = () => {
    const selectedWallet = this.generated.stores.wallets.selected;
    if (selectedWallet == null) {
      const wallets = this.generated.stores.wallets.publicDerivers;
      const firstWallet = wallets[0];
      this.switchWallet(firstWallet);
    }
  };

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
        <ThemeSettingsBlock
          currentTheme={currentTheme}
          switchToFirstWallet={this.handleSwitchToFirstWallet}
          selectTheme={this.generated.actions.profile.updateTheme.trigger}
          exportTheme={this.generated.actions.profile.exportTheme.trigger}
          hasCustomTheme={this.generated.stores.profile.hasCustomTheme}
          onExternalLinkClick={handleExternalLinkClick}
        />
        <AboutYoroiSettingsBlock
          wallet={this.generated.stores.wallets.selected}
        />
      </>
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        exportTheme: {|
          trigger: (params: void) => Promise<void>,
        |},
        updateLocale: {|
          trigger: (params: {|
            locale: string,
          |}) => Promise<void>,
        |},
        updateTheme: {|
          trigger: (params: {|
            theme: string,
          |}) => Promise<void>,
        |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    stores: {|
      app: {| currentRoute: string |},
      profile: {|
        LANGUAGE_OPTIONS: Array<LanguageType>,
        currentLocale: string,
        currentTheme: Theme,
        hasCustomTheme: void => boolean,
        setProfileLocaleRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        publicDerivers: Array<PublicDeriver<>>,
      |},
    |},
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
        app: {
          currentRoute: stores.app.currentRoute,
        },
        profile: {
          setProfileLocaleRequest: {
            isExecuting: profileStore.setProfileLocaleRequest.isExecuting,
            error: profileStore.setProfileLocaleRequest.error,
          },
          LANGUAGE_OPTIONS: profileStore.LANGUAGE_OPTIONS,
          currentLocale: profileStore.currentLocale,
          currentTheme: profileStore.currentTheme,
          hasCustomTheme: profileStore.hasCustomTheme,
        },
        wallets: {
          selected: stores.wallets.selected,
          publicDerivers: stores.wallets.publicDerivers,
        },
      },
      actions: {
        profile: {
          updateLocale: { trigger: actions.profile.updateLocale.trigger },
          updateTheme: { trigger: actions.profile.updateTheme.trigger },
          exportTheme: { trigger: actions.profile.exportTheme.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
      },
    });
  }
}
