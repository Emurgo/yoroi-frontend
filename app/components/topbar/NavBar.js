// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavBar.scss';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
  +walletPlate?: ?Node,
  +walletDetails?: ?Node,
|};

@observer
export default class NavBar extends Component<Props> {
  static defaultProps = {
    children: undefined,
    walletPlate: undefined,
    walletDetails: undefined,
  };

  render() {
    const {
      title,
      children,
      walletPlate,
      walletDetails,
    } = this.props;

    return (
      <header className={styles.navbar}>
        <div className={styles.title}>
          {title}
        </div>
        <div className={styles.content}>
          {children}
          <div className={styles.plate}>
            {walletPlate}
          </div>
          <div className={styles.details}>
            {walletDetails}
          </div>
        </div>
      </header>
    );
  }
}
