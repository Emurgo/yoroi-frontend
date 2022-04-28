// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import { intlShape, } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

import styles from './WalletSync.scss';

type Props = {|
  +time: ?string,
  +isRefreshing: boolean,
|};

@observer
export default class WalletSync extends Component<Props> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { time, isRefreshing } = this.props;
    const { intl } = this.context;

    if (isRefreshing) {
      return (
        <div className={styles.wrapper}>
          <span className={styles.text}>
            {intl.formatMessage(globalMessages.syncing)}
          </span>
        </div>
      );
    }

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
