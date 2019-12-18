// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';

import styles from './MyWallets.scss';

type Props = {|
  +children: Node,
  +pageTitle: string,
|};

@observer
export default class MyWallets extends Component<Props> {

  render() {
    const { children, pageTitle } = this.props;

    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{pageTitle}</h1>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    );
  }
}
