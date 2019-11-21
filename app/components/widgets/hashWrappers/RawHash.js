// @flow

import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import classnames from 'classnames';
import styles from './RawHash.scss';

type Props = {|
  +children: ?Node,
  +light: boolean,
|};

@observer
export default class RawHash extends Component<Props> {
  render() {
    const addressClasses = classnames([
      styles.hash,
      this.props.light ? styles.lightColor : styles.darkColor
    ]);
    return (
      <span className={addressClasses}>{this.props.children}</span>
    );
  }
}
