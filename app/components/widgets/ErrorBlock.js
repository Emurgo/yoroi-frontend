// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import LocalizableError from '../../i18n/LocalizableError';
import { Logger, stringifyError } from '../../utils/logging';

import styles from './ErrorBlock.scss';

type Props = {
  error: ?LocalizableError,
  isClassicThemeActive?: boolean
};

@observer
export default class ErrorBlock extends Component<Props> {
  static defaultProps = {
    isClassicThemeActive: false
  }

  static contextTypes = {
    intl: intlShape.isRequired
  };

  render() {
    const { intl } = this.context;
    const { error, isClassicThemeActive } = this.props;

    let errorText = '';
    try {
      errorText = (error) ? intl.formatMessage(error) : '';
    } catch (e) {
      Logger.error(`ErrorBlock:render ${stringifyError(e)}`);
    }

    return (
      <div className={isClassicThemeActive ? styles.errorBlock : styles.errorBlock}>
        <span>{errorText}</span>
      </div>);
  }
}
