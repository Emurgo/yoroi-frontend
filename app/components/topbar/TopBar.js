// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './TopBar.scss';

type Props = {|
  +children?: ?Node,
  +title: ?Node,
|};

@observer
export default class TopBar extends Component<Props> {
  static defaultProps: {|
    children: void,
  |} = {
    children: undefined,
  };

  render(): Node {
    const {
      title,
    } = this.props;

    return (
      <header className={styles.topBar}>
        <div className={styles.topBarTitle}>{title}</div>
        {this.props.children}
      </header>
    );
  }
}
