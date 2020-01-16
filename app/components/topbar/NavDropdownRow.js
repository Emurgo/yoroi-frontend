// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './NavDropdownRow.scss';

type Props = {|
  +title?: string,
  +plateComponent?: ?Node,
  +detailComponent: Node,
  +syncTime?: string,
  +isCurrentWallet?: boolean,
|};

export default class NavDropdownRow extends Component<Props> {

  static defaultProps = {
    title: undefined,
    plateComponent: undefined,
    syncTime: undefined,
    isCurrentWallet: false,
  }

  render() {
    const { title, plateComponent, detailComponent, syncTime, isCurrentWallet } = this.props;

    const wrapperClassname = classnames(
      styles.wrapper,
      isCurrentWallet !== null && isCurrentWallet === true && styles.currentWrapper,
      plateComponent === undefined && title !== undefined && styles.titleWrapper,
    );

    return (
      <div className={wrapperClassname}>
        <div className={styles.head}>
          {plateComponent !== undefined ?
            plateComponent :
            <p className={styles.title}>{title}</p>
          }
        </div>
        <div className={styles.details}>
          {detailComponent}
        </div>
        {syncTime !== undefined &&
          <div className={styles.sync}>
            <span className={styles.syncLabel}>Last sync:</span> {syncTime}
          </div>
        }
      </div>
    );
  }
}
