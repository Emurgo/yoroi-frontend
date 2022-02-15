// // @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { InjectedOrGeneratedConnector } from '../../types/injectedPropsType';

import Settings from '../components/Settings';
import { computed } from 'mobx';
import LocalizableError from '../../i18n/LocalizableError';
import type { LanguageType } from '../../i18n/translations';
import SettingLayout from '../components/layout/SettingLayout';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  ...InjectedOrGeneratedConnector<GeneratedData>,
  history: {
    goBack: void => void,
    ...
  },
|};
type GeneratedData = typeof SettingsContainer.prototype.generated;

@observer
export default class SettingsContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  goBack: void => void = () => {
    this.props.history.goBack();
  };

  render(): Node {
    const { intl } = this.context;
    const profileStore = this.generated.stores.profile;

    const isSubmittingLocale = profileStore.setProfileLocaleRequest.isExecuting;

    return (
      <SettingLayout
        goBack={this.goBack}
        headerLabel={intl.formatMessage(globalMessages.sidebarSettings)}
      >
        <Settings
          onSelectLanguage={this.generated.actions.profile.updateLocale.trigger}
          isSubmitting={isSubmittingLocale}
          languages={profileStore.LANGUAGE_OPTIONS}
          currentLocale={profileStore.currentLocale}
          error={profileStore.setProfileLocaleRequest.error}
          signingMessage={this.generated.stores.connector.signingMessage}
        />
      </SettingLayout>
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
        connector: {
          signingMessage: stores.connector.signingMessage,
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
