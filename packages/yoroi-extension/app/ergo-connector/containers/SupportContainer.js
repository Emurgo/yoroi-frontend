// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { observer } from 'mobx-react';

import SupportPage from '../components/SupportPage';
import globalMessages from '../../i18n/global-messages';
import SettingLayout from '../components/layout/SettingLayout';

type Props = {|
  history: {
    goBack: void => void,
    ...
  },
|};

@observer
export default class SupportContainer extends Component<Props> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  goBack: void => void = () => {
    this.props.history.goBack();
  };

  render(): Node {
    const { intl } = this.context;

    return (
      <SettingLayout goBack={this.goBack} headerLabel={intl.formatMessage(globalMessages.support)}>
        <SupportPage />
      </SettingLayout>
    );
  }
}
