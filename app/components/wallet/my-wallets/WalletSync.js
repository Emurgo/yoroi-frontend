// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import { intlShape, defineMessages } from 'react-intl';

import styles from './WalletSync.scss';

const messages = defineMessages({
  lastSyncMessage: {
    id: 'myWallets.wallets.lastSyncText',
    defaultMessage: '!!!Last sync',
  },
});

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
            {intl.formatMessage(messages.lastSyncMessage)}
          </span>
        </div>
      )
      : null;
  }
}
