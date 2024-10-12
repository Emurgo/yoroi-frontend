// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape  } from 'react-intl';
import OptForAnalyticsForm from '../../../components/profile/terms-of-use/OptForAnalyticsForm';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

@observer
export default class AnalyticsSettingsPage extends Component<StoresAndActionsProps> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    return (
      <OptForAnalyticsForm
        onOpt={this.props.stores.profile.onOptForAnalytics}
        variant="settings"
        isOptedIn={this.props.stores.profile.analyticsOption}
      />
    );
  }
}
