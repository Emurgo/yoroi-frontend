// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import TransferNavigation from '../navigation/TransferNavigation';
import type { TransferNavigationProps } from '../navigation/TransferNavigation';
import styles from './TransferWithNavigation.scss';

export type { TransferNavigationProps };

type Props = {|
  children?: Node,
  isActiveScreen: $PropertyType<TransferNavigationProps, 'isActiveNavItem'>,
  onTransferNavItemClick: $PropertyType<TransferNavigationProps, 'onNavItemClick'>,
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
