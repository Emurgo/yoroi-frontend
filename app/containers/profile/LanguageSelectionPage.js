// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import StaticTopbarTitle from '../../components/topbar/StaticTopbarTitle';
import TopBar from '../../components/topbar/TopBar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { InjectedProps } from '../../types/injectedPropsType';

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

  onSubmit = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const { topbar, profile } = this.props.stores;
    const topBartitle = (
      <StaticTopbarTitle title={this.context.intl.formatMessage(messages.title)} />
    );
    const topBar = (
      <TopBar
        title={topBartitle}
        activeTopbarCategory={topbar.activeTopbarCategory}
        classicTheme={profile.isClassicTheme}
      />);
    return (
      <TopBarLayout
        topbar={topBar}
        classicTheme={profile.isClassicTheme}
        noTopbarNoBanner={profile.isModernTheme}
        languageSelectionBackground
      >
        <LanguageSelectionForm
          onSubmit={this.onSubmit}
          isSubmitting={isSubmitting}
          languages={LANGUAGE_OPTIONS}
          error={setProfileLocaleRequest.error}
        />
      </TopBarLayout>
    );
  }
}
