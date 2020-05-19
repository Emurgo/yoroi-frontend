// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import styles from './ReceiveWithNavigation.scss';

type Props = {|
  +children?: Node,
  +isActiveTab: ('internal' | 'external' | 'mangled') => boolean,
  +onTabClick: string => void,
  +showMangled: boolean,
|};

@observer
export default class ReceiveWithNavigation extends Component<Props> {
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children, isActiveTab, onTabClick } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <ReceiveNavigation
            isActiveTab={isActiveTab}
            onTabClick={onTabClick}
            showMangled={this.props.showMangled}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
