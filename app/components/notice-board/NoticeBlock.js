// @flow
import React, { Component } from 'react';
import { defineMessages } from 'react-intl';

import styles from './NoticeBlock.scss';
import Notice from '../../domain/Notice';

const messages = defineMessages({
  type: {
    id: 'wallet.transaction.type',
    defaultMessage: '!!!{currency} transaction',
  },
});

type Props = {|
  +notice: Notice
|};

export default class NoticeBlock extends Component<Props> {

  render() {
    return (
      <div className={styles.component}>
        <div>
          <div className={styles.iconBlock}>LEFT</div>
          <div className={styles.textBlock}>
            <div className={styles.primary}>
              <div className={styles.title}>TITLE</div>
              {this.props.notice.kind}
              <div className={styles.date}>DATE</div>
            </div>
            <div>SECONDARY</div>
          </div>
        </div>
        <div className={styles.line} />
      </div>
    );
  }
}
