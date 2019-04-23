// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './BorderedBox.scss';

type Props = {
  children?: Node,
  isClassicThemeActive: boolean
};

@observer
export default class BorderedBox extends Component<Props> {
  static defaultProps = {
    children: undefined
  };

  render() {
    const { children, isClassicThemeActive } = this.props;
    return (
      <div className={isClassicThemeActive ? styles.componentClassic : styles.component}>
        {children}
      </div>
    );
  }
}
