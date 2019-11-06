// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import StakingNavigation from '../navigation/StakingNavigation';
import styles from './StakingWithNavigation.scss';

type Props = {|
  children?: Node,
  isActiveScreen: string => boolean,
  onWalletNavItemClick: string => void,
|};

@observer
export default class StakingWithNavigation extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children, isActiveScreen, onWalletNavItemClick } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <StakingNavigation
            isActiveNavItem={isActiveScreen}
            onNavItemClick={onWalletNavItemClick}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
