// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classnames from 'classnames';

import LocalizableError from '../../../../i18n/LocalizableError';

import type { ProgressInfo } from '../../../../stores/ada/TrezorConnectStore'

// TODO: remove unwated style
import styles from './ErrorBlock.scss';

type Props = {
  progressInfo: ProgressInfo,
  error: ?LocalizableError,
};

@observer
export default class ErrorBlock extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const errorText = (this.props.error) ? intl.formatMessage(this.props.error) : '';

    return (
      <div className={classnames([styles.liveInfoComponent, styles.errorBlock])}>
        <span>{errorText}</span>
      </div>);
  }
}
