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
  +children: ?Node
|};

export default class WarningBox extends Component<Props> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { children } = this.props;
    return (
      <div className={styles.component}>
        {/* Warning header  */}
        <div className={styles.header}>
          <div className={styles.headerIcon} />
          <span className={styles.headerText}>
            {intl.formatMessage(messages.headerText)}
          </span>
        </div>
        {/* Warning content  */}
        <div className={styles.warning}>{children}</div>

      </div>
    );
  }
}
