// @flow
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import TextOnlyTopBar from '../../components/layout/TextOnlyTopbar';
import TopBarLayout from '../../components/layout/TopBarLayout';
import LanguageSelectionForm from '../../components/profile/language-selection/LanguageSelectionForm';
import type { InjectedProps } from '../../types/injectedPropsType';

const messages = defineMessages({
  title: {
    id: 'profile.languageSelect.title',
    defaultMessage: '!!!Language Select',
    description: 'Language Select Title.'
  },
});

@inject('stores', 'actions') @observer
export default class LanguageSelectionPage extends Component<InjectedProps> {

  static defaultProps = { actions: null, stores: null };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  onSubmit = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    const topbar = <TextOnlyTopBar title={this.context.intl.formatMessage(messages.title)} />
    return (
      <TopBarLayout
        topbar={topbar}
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
