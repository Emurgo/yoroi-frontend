// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import LockScreenSettings from '../../../components/settings/categories/LockScreenSettings';
import type { InjectedProps } from '../../../types/injectedPropsType';

@observer
export default class GeneralSettingsPage extends Component<InjectedProps> {

  onSelectLanguage = (values: { locale: string }) => {
    this.props.actions.profile.updateLocale.trigger(values);
  };

  render() {
    const { setProfileLocaleRequest, LANGUAGE_OPTIONS, currentLocale } = this.props.stores.profile;
    const isSubmitting = setProfileLocaleRequest.isExecuting;
    return (
      <LockScreenSettings
        onSelectLanguage={this.onSelectLanguage}
        isSubmitting={isSubmitting}
        languages={LANGUAGE_OPTIONS}
        currentLocale={currentLocale}
        error={setProfileLocaleRequest.error}
      />
    );
  }

}
