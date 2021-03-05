// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import styles from './TooltipBox.scss';
import globalMessages from '../../i18n/global-messages';
import WarningIcon from '../../assets/images/attention-modern.inline.svg';
import CloseCross from '../../assets/images/small-cross.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
  +children: ?Node,
  +onClose: void => void,
|};

@observer
export default class TooltipBox extends Component<Props> {
  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { children } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.header}>
          <div className={styles.message}>
            <div className={styles.headerIcon}>
              <WarningIcon />
            </div>
            <span className={styles.headerText}>
              {intl.formatMessage(globalMessages.attentionHeaderText)}
            </span>
          </div>
          <div className={styles.closeButton}>
            <CloseCross onClick={this.props.onClose} />
          </div>
        </div>
        {/* Warning content  */}
        <div className={styles.body}>{children}</div>
      </div>
    );
  }
}
