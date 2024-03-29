// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import globalMessages from '../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './WarningBox.scss';

type Props = {|
  +children: ?Node
|};

@observer
export default class WarningBox extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
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
