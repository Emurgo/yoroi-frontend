// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import classnames from 'classnames';

import LocalizableError from '../../../../i18n/LocalizableError';
// TODO: remove unwated style
import styles from './ErrorBlock.scss';

import type { ProgressState } from '../../../../stores/ada/TrezorConnetStore';
import { ProgressStateOption } from '../../../../stores/ada/TrezorConnetStore';

type Props = {
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
