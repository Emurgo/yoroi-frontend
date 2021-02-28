// // @flow
import type { Node } from 'react';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';

import Settings from '../components/Settings';
import { computed } from 'mobx';
import LocalizableError from '../../i18n/LocalizableError';
import type { LanguageType } from '../../i18n/translations';

type GeneratedData = typeof SettingsContainer.prototype.generated;

@observer
export default class SettingsContainer extends Component<
  InjectedOrGeneratedConnector<GeneratedData>
> {
  goBack: void => void = () => {
    this.props.history.goBack();
  };

  render(): Node {
    const profileStore = this.generated.stores.profile;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;

    return (
      <Settings
        onSelectLanguage={this.generated.actions.profile.updateLocale.trigger}
        isSubmitting={isSubmittingLocale}
        languages={profileStore.LANGUAGE_OPTIONS}
        currentLocale={profileStore.currentLocale}
        error={profileStore.setProfileLocaleRequest.error}
        goBack={this.goBack}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        updateLocale: {|
          trigger: (params: {|
            locale: string,
          |}) => Promise<void>,
        |},
      |},
    |},
    stores: {|
      profile: {|
        LANGUAGE_OPTIONS: Array<LanguageType>,
        currentLocale: string,
        setProfileLocaleRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(SettingsContainer)} no way to generated props`);
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
        },
      },
      actions: {
        profile: {
          updateLocale: { trigger: actions.profile.updateLocale.trigger },
        },
      },
    });
  }
}
