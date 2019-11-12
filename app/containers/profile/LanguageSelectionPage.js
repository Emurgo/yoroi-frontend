// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import IntroBanner from '../../components/profile/language-selection/IntroBanner';

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.title',
    defaultMessage: '!!!Language Select',
  },
});

@observer
export default class LanguageSelectionPage extends Component<InjectedProps> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  async componentDidMount() {
    const profileStore = this.props.stores.profile;

    // if user uses back button to get back to this page
    // we need to undo saving the language to storage so they can pick a new language
    if (profileStore.isCurrentLocaleSet) {
      const prevLang = profileStore.currentLocale;
      runInAction(() => {
        // tentatively set language to their previous selection
        profileStore.inMemoryLanguage = prevLang;
      });
    }

    await this.props.stores.profile.unsetProfileLocaleRequest.execute();
    await this.props.stores.profile.getProfileLocaleRequest.execute();
  }

  onSelectLanguage = (values: {| locale: string |}) => {
    this.props.actions.profile.updateTentativeLocale.trigger(values);
  };

  onSubmit = (values: { locale: string }) => {
    this.props.actions.profile.commitLocaleToStorage.trigger(values);
  };

  renderByron() {
    const { setProfileLocaleRequest, currentLocale, LANGUAGE_OPTIONS } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = profile.isClassicTheme ? (
      <TopBar
        title={topBartitle}
      />) : undefined;
    const displayedBanner = checkAdaServerStatus === 'healthy'
      ? <TestnetWarningBanner />
      : <ServerErrorBanner errorType={checkAdaServerStatus} />;
    return (
      <TopBarLayout
        topbar={topBar}
        banner={displayedBanner}
      >
        <LanguageSelectionForm
          onSelectLanguage={this.onSelectLanguage}
          onSubmit={this.onSubmit}
          isSubmitting={isSubmitting}
          currentLocale={currentLocale}
          languages={LANGUAGE_OPTIONS}
          error={setProfileLocaleRequest.error}
        />
      </TopBarLayout>
    );
  }

  renderShelley() {
    const { setProfileLocaleRequest, currentLocale, LANGUAGE_OPTIONS } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { stores } = this.props;
    const { profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = profile.isClassicTheme ? (
      <TopBar
        title={topBartitle}
      />) : undefined;
    const displayedBanner = checkAdaServerStatus === 'healthy'
      ? undefined
      : <ServerErrorBanner errorType={checkAdaServerStatus} />;
    return (
      <TopBarLayout
        topbar={topBar}
        banner={displayedBanner}
      >
        <IntroBanner />
        <LanguageSelectionForm
          onSelectLanguage={this.onSelectLanguage}
          onSubmit={this.onSubmit}
          isSubmitting={isSubmitting}
          currentLocale={currentLocale}
          languages={LANGUAGE_OPTIONS}
          error={setProfileLocaleRequest.error}
        />
      </TopBarLayout>
    );
  }

  render() {
    if (environment.isShelley()) {
      return this.renderShelley();
    }
    return this.renderByron();
  }
}
