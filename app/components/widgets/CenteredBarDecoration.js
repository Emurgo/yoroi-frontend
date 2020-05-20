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
  static defaultProps: {|children: void|} = {
    children: undefined
  };

  render(): Node {
    const { children } = this.props;
    return (children == null
      ? (<div className={styles.solidSeparator} />)
      : (<div className={styles.separator}>{children}</div>)
    );
  }
}
