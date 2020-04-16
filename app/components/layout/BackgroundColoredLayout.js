// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './BackgroundColoredLayout.scss';

type Props = {|
  +children: Node
|};

@observer
export default class BackgroundColoredLayout extends Component<Props> {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.component}>
        {children}
      </div>
    );
  }
}
