// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import SettingLayout from '../components/layout/SettingLayout';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import { intlShape } from 'react-intl';
import AboutPage from '../components/AboutPage';
import { connectorMessages } from '../../i18n/global-messages';

type Props = {|
  history: {
    goBack: void => void,
    ...
  },
|};
@observer
export default class AboutContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  goBack: void => void = () => {
    this.props.history.goBack();
  };
  render(): Node {
    const { intl } = this.context;

    return (
      <SettingLayout goBack={this.goBack} headerLabel={intl.formatMessage(connectorMessages.about)}>
        <AboutPage />
      </SettingLayout>
    );
  }
}
