// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import WalletNavigation from '../navigation/WalletNavigation';
import styles from './WalletWithNavigation.scss';
import { PublicDeriver } from '../../../api/ada/lib/storage/models/PublicDeriver';

type Props = {|
  +children?: Node,
  +wallet: PublicDeriver<>,
  +isActiveScreen: (string, ?boolean) => boolean,
  +onWalletNavItemClick: string => void,
|};

@observer
export default class WalletWithNavigation extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, isActiveScreen, onWalletNavItemClick } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <WalletNavigation
            wallet={this.props.wallet}
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
