// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import LocalizableError from '../../../../i18n/LocalizableError';
import type { ProgressInfo } from '../../../../stores/ada/TrezorConnectStore';

import { Logger, stringifyError } from '../../../../utils/logging';

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
    const { error } = this.props;

    let errorText = '';
    try {
      errorText = (error) ? intl.formatMessage(error) : '';
    } catch (e) {
      Logger.error(`trezorConnect::common::ErrorBlock:render ${stringifyError(e)}`);
    }

    return (
      <div className={styles.errorBlock}>
        <span>{errorText}</span>
      </div>);
  }
}
