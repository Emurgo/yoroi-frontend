// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { intlShape, defineMessages } from 'react-intl';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './NavDropdownRow.scss';

const messages = defineMessages({
  lastSyncMessage: {
    id: 'wallet.nav.lastSync',
    defaultMessage: '!!!Last sync:',
  },
});

type Props = {|
  +title?: string,
  +plateComponent?: ?Node,
  +detailComponent: Node,
  +syncTime?: ?string,
  +isCurrentWallet?: boolean,
  +onSelect: void => void,
|};

@observer
export default class NavDropdownRow extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    title: undefined,
    plateComponent: undefined,
    syncTime: undefined,
    isCurrentWallet: false,
  }

  render() {
    const { title, plateComponent, detailComponent, syncTime, isCurrentWallet } = this.props;

    const { intl } = this.context;

    const wrapperClassname = classnames(
      styles.wrapper,
      isCurrentWallet !== null && isCurrentWallet === true && styles.currentWrapper,
      plateComponent === undefined && title !== undefined && styles.titleWrapper,
    );

    return (
      <div className={wrapperClassname}>
        <button
          className={styles.head}
          type="button"
          onClick={this.props.onSelect}
        >
          {plateComponent !== undefined ?
            plateComponent :
            <p className={styles.title}>{title}</p>
          }
        </button>
        <div className={styles.details}>
          {detailComponent}
        </div>
        {syncTime != null &&
          <div className={styles.sync}>
            <span className={styles.syncLabel}>
              {intl.formatMessage(messages.lastSyncMessage)}
            </span> {syncTime}
          </div>
        }
      </div>
    );
  }
}
