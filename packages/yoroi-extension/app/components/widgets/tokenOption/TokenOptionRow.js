// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import styles from './TokenOptionRow.scss';

type Props = {|
  +displayName: string,
  +id?: string,
  +amount?: string,
  +nameOnly?: boolean
|};

@observer
export default class TokenOptionRow extends Component<Props> {

  static defaultProps: {|
    id: string,
    amount: number,
    nameOnly: boolean,
  |} = {
    id: '',
    amount: '',
    nameOnly: false,
  };

  render(): Node {
    const notOnlyName = !this.props.nameOnly;
    return (
      <div className={classnames([styles.container, styles.rowText])}>
        <div className={styles.item_name}>{this.props.displayName}</div>
        {notOnlyName ? (
          <>
            <div className={styles.item_amount}>{this.props.amount}</div>
            <div className={styles.item_id}> {this.props.id}</div>
          </>
        ) : null}

      </div>
    );
  }
}
