// @flow
import React, { Component } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import styles from './NoticeBoard.scss';

const messages = defineMessages({
  type: {
    id: 'wallet.transaction.type',
    defaultMessage: '!!!{currency} transaction',
  },
});

type Props = {|
|};


export default class NoticeBoard extends Component<Props> {
  static contextTypes = { intl: intlShape.isRequired };

  render() {

    return (
      <div className={styles.component}>Notification</div>
    );
  }
}
