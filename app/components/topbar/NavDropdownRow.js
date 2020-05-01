// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape, } from 'react-intl';
import classnames from 'classnames';
import styles from './NavDropdownRow.scss';
import globalMessages from '../../i18n/global-messages';

type Props = {|
  +title?: string,
  +plateComponent?: ?Node,
  +detailComponent: Node,
  /**
   * null -> never synced
   * undefined -> don't display sync info
   */
  +syncTime?: void | null | string,
  +isCurrentWallet?: boolean,
  +onSelect?: void => void,
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
    onSelect: undefined,
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

    const titleSection = this.getHead();
    return (
      <div className={wrapperClassname}>
        {titleSection}
        <div className={styles.details}>
          {detailComponent}
        </div>
        {syncTime != null &&
          <div className={styles.sync}>
            <span className={styles.syncLabel}>
              {intl.formatMessage(globalMessages.lastSyncMessage)}:
            </span> {syncTime}
          </div>
        }
        {syncTime === null &&
          <div className={styles.sync}>
            <span className={styles.syncLabel}>
              {intl.formatMessage(globalMessages.neverSyncedMessage)}
            </span>
          </div>
        }
      </div>
    );
  }

  getHead: void => Node = () => {
    if (this.props.plateComponent != null && this.props.onSelect != null) {
      if (this.props.isCurrentWallet !== true) {
        return (
          <button
            className={styles.head}
            type="button"
            onClick={this.props.onSelect}
          >
            {this.props.plateComponent}
          </button>
        );
      }
      return (
        <div
          className={styles.head}
        >
          {this.props.plateComponent}
        </div>
      );
    }
    return (
      <div className={styles.head}>
        <p className={styles.title}>{this.props.title}</p>
      </div>
    );
  }
}
