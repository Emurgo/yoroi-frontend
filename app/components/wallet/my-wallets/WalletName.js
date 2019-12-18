// @flow
import React, { Component } from 'react';
import type { Node } from 'react';

import styles from './WalletName.scss';

type Props = {|
    +name: string,
    +icon: Node,
|};

export default class WalletName extends Component<Props> {

  render() {
    const { name, icon } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.icon}>
          {icon}
        </div>
        <h2 className={styles.name}>{name}</h2>
      </div>
    );
  }
}
