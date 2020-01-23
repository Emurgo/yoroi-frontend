// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import ReceiveNavigation from '../navigation/ReceiveNavigation';
import styles from './ReceiveWithNavigation.scss';

type Props = {|
  +children?: Node,
  +isActiveTab: string => boolean,
  +onTabClick: string => void,
|};

@observer
export default class ReceiveWithNavigation extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children, isActiveTab, onTabClick } = this.props;
    return (
      <div className={styles.component}>
        <div className={styles.navigation}>
          <ReceiveNavigation
            isActiveTab={isActiveTab}
            onTabClick={onTabClick}
          />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    );
  }
}
