// @flow
import type { Node } from 'react';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { StoresProps } from '../../../stores';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { IntlContext  } from 'react-intl';
import OptForAnalyticsForm from '../../../components/profile/terms-of-use/OptForAnalyticsForm';

@observer
export default class AnalyticsSettingsPage extends Component<StoresProps> {
  static contextType:any = IntlContext;
  render(): Node {
    return (
      <OptForAnalyticsForm
        onOpt={this.props.stores.profile.onOptForAnalytics}
        variant="settings"
        isOptedIn={this.props.stores.profile.analyticsOption}
        privacyNotice={this.props.stores.profile.privacyNotice}
      />
    );
  }
}
