// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import ErrorBlock from '../../../widgets/ErrorBlock';
import LocalizableError from '../../../../i18n/LocalizableError';
import type { ProgressInfo } from '../../../../stores/ada/TrezorConnectStore';

// this component will only re-render when there is change in progressInfo
type Props = {
  progressInfo: ProgressInfo,
  error: ?LocalizableError,
  classicTheme: boolean
};

@observer
export default class TrezorErrorBlock extends Component<Props> {
  render() {
    return (<ErrorBlock error={this.props.error} classicTheme={this.props.classicTheme} />);
  }
}
