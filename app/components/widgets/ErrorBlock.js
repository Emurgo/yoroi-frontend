// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';

import LocalizableError from '../../i18n/LocalizableError';
import { Logger, stringifyError } from '../../utils/logging';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './ErrorBlock.scss';

type Props = {|
  +error: ?LocalizableError,
|};

@observer
export default class ErrorBlock extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired
  };

  render(): Node {
    const { intl } = this.context;
    const { error } = this.props;

    let errorText = '';
    try {
      errorText = (error) ? intl.formatMessage(error) : '';
    } catch (e) {
      Logger.error(`ErrorBlock:render ${stringifyError(e)}`);
    }

    return (
      <div className={styles.component}>
        <span>{errorText}</span>
      </div>);
  }
}
