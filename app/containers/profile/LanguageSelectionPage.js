// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import environment from '../../environment';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { InjectedProps } from '../../types/injectedPropsType';
import TestnetWarningBanner from '../../components/topbar/banners/TestnetWarningBanner';
import ServerErrorBanner from '../../components/topbar/banners/ServerErrorBanner';
import type { ServerStatusErrorType } from '../../types/serverStatusErrorType';

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

  onSelectLanguage = (values: { locale: string }) => {
    this.props.actions.profile.updateTentativeLocale.trigger(values);
  };

  onSubmit = (values: { locale: string }) => {
    this.props.actions.profile.commitLocaleToStorage.trigger(values);
  };


  render() {
    const { setProfileLocaleRequest, currentLocale, LANGUAGE_OPTIONS } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { stores } = this.props;
    const { topbar, profile } = stores;
    const { checkAdaServerStatus } = stores.substores[environment.API].serverConnectionStore;
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = profile.isClassicTheme ? (
      <TopBar
        title={topBartitle}
        activeTopbarCategory={topbar.activeTopbarCategory}
      />) : undefined;
    const displayedBanner = (connectionErrorType: ServerStatusErrorType) => {
      connectionErrorType === 'healthy' ?
        <TestnetWarningBanner /> :
        <ServerErrorBanner errorType={connectionErrorType} />;
    };
    return (
      <TopBarLayout
        topbar={topBar}
        classicTheme={profile.isClassicTheme}
        languageSelectionBackground
        banner={displayedBanner(checkAdaServerStatus)}
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
}
