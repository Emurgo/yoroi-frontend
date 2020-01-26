// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';

import styles from './WarningBox.scss';

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
            {intl.formatMessage(globalMessages.attentionHeaderText)}
          </span>
        </div>
        {/* Warning content  */}
        <div className={styles.warning}>{children}</div>

      </div>
    );
  }
}
