// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import WalletNavigation from '../navigation/WalletNavigation';
import type { Category } from '../navigation/WalletNavigation';
import styles from './WalletWithNavigation.scss';

type Props = {|
  +children?: Node,
  +categories: Array<Category>,
|};

@observer
export default class WalletWithNavigation extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <WalletNavigation
            categories={this.props.categories}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
