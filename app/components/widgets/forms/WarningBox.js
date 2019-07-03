// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';

import styles from './WarningBox.scss';

const messages = defineMessages({
  headerText: {
    id: 'widgets.warningBox.headerText',
    defaultMessage: '!!!ATTENTION:',
  },
});

type Props = {|
  children: ?Node
|};

export default class WarningBox extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { children } = this.props;
    return (
      <div className={styles.contentWarning}>
        <div className={styles.header}>
          <div className={styles.headerIcon} />
          <span className={styles.headerText}>
            {intl.formatMessage(messages.headerText)}
          </span>
        </div>
        <div className={styles.warning}>{children}</div>
      </div>
    );
  }
}
