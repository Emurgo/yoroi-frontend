// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { intlShape, } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';

import styles from './WalletSync.scss';

type Props = {|
  +time: ?string,
|};

@observer
export default class WalletSync extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { time } = this.props;
    const { intl } = this.context;

    return this.props.time != null
      ? (
        <div className={styles.wrapper}>
          {time}
          <span className={styles.text}>
            {intl.formatMessage(globalMessages.lastSyncMessage)}
          </span>
        </div>
      )
      : (
        <div className={styles.wrapper}>
          <span className={styles.text}>
            {intl.formatMessage(globalMessages.neverSyncedMessage)}
          </span>
        </div>
      );
  }
}
