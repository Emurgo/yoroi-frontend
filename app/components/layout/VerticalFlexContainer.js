// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './VerticalFlexContainer.scss';

type Props = {
  children?: ?Node,
};

export default
@observer
class VerticalFlexContainer extends Component<Props> {
  render() {
    const { children } = this.props;
    return (
      <div className={styles.component}>
        {children}
      </div>
    );
  }
}
