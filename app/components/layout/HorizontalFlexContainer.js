// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './HorizontalFlexContainer.scss';

type Props = {|
  +children: ?Node,
|};

@observer
export default class HorizontalFlexContainer extends Component<Props> {
  render(): Node {
    const { children } = this.props;
    return (
      <div className={styles.component}>
        {children}
      </div>
    );
  }
}
