// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import styles from './TokenOptionRow.scss';

type Props = {|
  +displayName: string,
  +id: string,
  +amount: string,
|};

@observer
export default class TokenOptionRow extends Component<Props> {
  render(): Node {
    return (
      <div className={classnames([styles.container, styles.rowText])}>
        <span>{this.props.displayName}</span>
        <span>{this.props.id}</span>
        <span>{this.props.amount}</span>
      </div>
    );
  }
}
