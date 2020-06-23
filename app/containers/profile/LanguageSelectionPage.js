// @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';
import { ServerStatusErrors } from '../../types/serverStatusErrorType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { LanguageType } from '../../i18n/translations';
import LocalizableError from '../../i18n/LocalizableError';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.title',
    defaultMessage: '!!!Language Select',
  },
});

type GeneratedData = typeof LanguageSelectionPage.prototype.generated;

@observer
export default class LanguageSelectionPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const profileStore = this.generated.stores.profile;
    // if user uses back button to get back to this page
    // we need to undo saving the language to storage so they can pick a new language
    if (profileStore.isCurrentLocaleSet) {
      const prevLang = profileStore.currentLocale;
      // tentatively set language to their previous selection
      this.generated.actions.profile.updateTentativeLocale.trigger({ locale: prevLang });
    }

    await this.generated.actions.profile.resetLocale.trigger();
  }

  onSelectLanguage: {| locale: string |} => void = (values) => {
    this.generated.actions.profile.updateTentativeLocale.trigger(values);
  };

  onSubmit: {| locale: string |} => Promise<void> = async (_values) => {
    await this.generated.actions.profile.commitLocaleToStorage.trigger();
  };

  renderByron(generated: GeneratedData): Node {
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = generated.stores.profile.isClassicTheme ? (
      <TopBar
        title={topBartitle}
      />) : undefined;
    const displayedBanner = generated.stores
      .serverConnectionStore.checkAdaServerStatus === ServerStatusErrors.Healthy
      ? <TestnetWarningBanner />
      : <ServerErrorBanner errorType={
        generated.stores.serverConnectionStore.checkAdaServerStatus
      }
      />;
    return (
      <TopBarLayout
        topbar={topBar}
        languageSelectionBackground
        banner={displayedBanner}
      >
        <IntroBanner
          isNightly={environment.isNightly()}
          isJormungandr={environment.isJormungandr()}
        />
        <LanguageSelectionForm
          onSelectLanguage={this.onSelectLanguage}
          onSubmit={this.onSubmit}
          isSubmitting={generated.stores.profile.setProfileLocaleRequest.isExecuting}
          currentLocale={generated.stores.profile.currentLocale}
          languages={generated.stores.profile.LANGUAGE_OPTIONS}
          error={generated.stores.profile.setProfileLocaleRequest.error}
        />
      </TopBarLayout>
    );
  }

  renderShelley(generated: GeneratedData): Node {
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = generated.stores.profile.isClassicTheme ? (
      <TopBar
        title={topBartitle}
      />) : undefined;
    const displayedBanner = generated.stores
      .serverConnectionStore.checkAdaServerStatus === ServerStatusErrors.Healthy
      ? undefined
      : <ServerErrorBanner errorType={
        generated.stores.serverConnectionStore.checkAdaServerStatus
      }
      />;
    return (
      <TopBarLayout
        topbar={topBar}
        languageSelectionBackground
        banner={displayedBanner}
      >
        <IntroBanner
          isNightly={environment.isNightly()}
          isJormungandr={environment.isJormungandr()}
        />
        <LanguageSelectionForm
          onSelectLanguage={this.onSelectLanguage}
          onSubmit={this.onSubmit}
          isSubmitting={generated.stores.profile.setProfileLocaleRequest.isExecuting}
          currentLocale={generated.stores.profile.currentLocale}
          languages={generated.stores.profile.LANGUAGE_OPTIONS}
          error={generated.stores.profile.setProfileLocaleRequest.error}
        />
      </TopBarLayout>
    );
  }

  render(): Node {
    if (environment.isJormungandr()) {
      return this.renderShelley(this.generated);
    }
    return this.renderByron(this.generated);
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        commitLocaleToStorage: {|
          trigger: (params: void) => Promise<void>
        |},
        resetLocale: {|
          trigger: (params: void) => Promise<void>
        |},
        updateTentativeLocale: {|
          trigger: (params: {| locale: string |}) => void
        |}
      |}
    |},
    stores: {|
      profile: {|
        LANGUAGE_OPTIONS: Array<LanguageType>,
        currentLocale: string,
        isClassicTheme: boolean,
        isCurrentLocaleSet: boolean,
        setProfileLocaleRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |}
      |},
      serverConnectionStore: {|
        checkAdaServerStatus: ServerStatusErrorType
      |}
    |}
    |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(LanguageSelectionPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const profileStore = stores.profile;
    return Object.freeze({
      stores: {
        profile: {
          LANGUAGE_OPTIONS: profileStore.LANGUAGE_OPTIONS,
          isCurrentLocaleSet: profileStore.isCurrentLocaleSet,
          currentLocale: profileStore.currentLocale,
          isClassicTheme: profileStore.isClassicTheme,
          setProfileLocaleRequest: {
            error: profileStore.setProfileLocaleRequest.error,
            isExecuting: profileStore.setProfileLocaleRequest.isExecuting,
          },
        },
        serverConnectionStore: {
          checkAdaServerStatus: stores.serverConnectionStore.checkAdaServerStatus,
        },
      },
      actions: {
        profile: {
          resetLocale: { trigger: actions.profile.resetLocale.trigger },
          updateTentativeLocale: { trigger: actions.profile.updateTentativeLocale.trigger },
          commitLocaleToStorage: { trigger: actions.profile.commitLocaleToStorage.trigger },
        },
      },
    });
  }
}
