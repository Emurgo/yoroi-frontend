// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './NavBarTitle.scss';

type Props = {|
  +title: string,
|};

@observer
export default class NavBarTitle extends Component<Props> {
  render(): Node {
    const { title } = this.props;

    return (
      <div className={styles.title}>{title}</div>
    );
  }
}
