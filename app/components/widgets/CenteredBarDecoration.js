// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './CenteredBarDecoration.scss';

type Props = {|
  +children?: Node,
|};

@observer
export default class CenteredBarDecoration extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children } = this.props;
    return (
      <div className={styles.separator}>{children}</div>
    );
  }
}
