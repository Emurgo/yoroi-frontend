// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TransferNavigation from '../navigation/TransferNavigation';
import styles from './TransferWithNavigation.scss';

type Props = {|
  children?: Node,
  isActiveScreen: Function,
  onTransferNavItemClick: Function,
|};

@observer
export default class TransferWithNavigation extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children, isActiveScreen, onTransferNavItemClick } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <TransferNavigation
            isActiveNavItem={isActiveScreen}
            onNavItemClick={onTransferNavItemClick}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
