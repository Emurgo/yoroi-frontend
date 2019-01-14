// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './BorderedBox.scss';

type Props = {
  children?: Node,
  oldTheme: boolean
};

@observer
export default class BorderedBox extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children, oldTheme } = this.props;
    return (
      <div className={oldTheme ? styles.componentOld : styles.component}>
        {children}
      </div>
    );
  }
}
