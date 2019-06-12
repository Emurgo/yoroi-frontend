// @flow

import { observer } from 'mobx-react';
import React, { Component } from 'react';
import classnames from 'classnames';
import type { Node } from 'react';
import styles from './UsableHash.scss';

type Props = {
  isUsed: boolean,
  children: ?Node,
};

@observer
export default class UsableHash extends Component<Props> {

  render() {
    const addressClasses = classnames([
      this.props.isUsed ? styles.usedHash : undefined,
    ]);

    return (
      <span className={addressClasses}>{this.props.children}</span>
    );
  }
}
