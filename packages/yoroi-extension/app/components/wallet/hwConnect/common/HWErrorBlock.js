// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';

import ErrorBlock from '../../../widgets/ErrorBlock';
import LocalizableError from '../../../../i18n/LocalizableError';
import { ProgressInfo } from '../../../../types/HWConnectStoreTypes';

// this component will only re-render when there is change in progressInfo
type Props = {|
  +progressInfo: ProgressInfo,
  +error: ?LocalizableError,
|};

@observer
export default class HWErrorBlock extends Component<Props> {
  render(): Node {
    return <ErrorBlock error={this.props.error} />;
  }
}
