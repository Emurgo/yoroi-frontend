// @flow

import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './RawHash.scss';

type Props = {
  children: ?Node,
};

@observer
export default class UsableHash extends Component<Props> {

  render() {
    return (
      <span className={styles.hash}>{this.props.children}</span>
    );
  }
}
