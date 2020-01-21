// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import styles from './MyWallets.scss';

type Props = {|
  +children: Node,
|};

@observer
export default class MyWallets extends Component<Props> {

  render() {
    const { children } = this.props;

    return (
      <div className={styles.page}>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    );
  }
}
