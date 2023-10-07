// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { intlShape  } from 'react-intl';
import OptForAnalyticsForm from '../../../components/profile/terms-of-use/OptForAnalyticsForm';
import type { InjectedOrGenerated } from '../../../types/injectedPropsType';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type GeneratedData = typeof AnalyticsSettingsPage.prototype.generated;

@observer
export default class AnalyticsSettingsPage extends Component<InjectedOrGenerated<GeneratedData>> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return (
      <OptForAnalyticsForm
        onOpt={this.generated.actions.profile.optForAnalytics.trigger}
        variant="settings"
        isOptedIn={this.generated.stores.profile.analyticsOption}
      />
    );
  }

  @computed get generated(): {|
    actions: {|
      profile: {|
        optForAnalytics: {| trigger: (boolean) => void |},
      |},
    |},
    stores: {|
      profile: {|
        analyticsOption: boolean,
      |},
    |},
  |} {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(AnalyticsSettingsPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    return Object.freeze({
      actions: {
        profile: {
          optForAnalytics: { trigger: actions.profile.optForAnalytics.trigger },
        },
      },
      stores: {
        profile: {
          analyticsOption: stores.profile.analyticsOption,
        },
      },
    });
  }
}
