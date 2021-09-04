// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import styles from './TokenOptionRow.scss';

type Props = {|
  +displayName: string,
  +id?: string,
  +amount?: string,
  nameOnly?: boolean | null
|};

@observer
export default class TokenOptionRow extends Component<Props> {
  render(): Node {
    return (
      <div className={classnames([styles.container, styles.rowText])}>
        <div className={styles.item_name}>{this.props.displayName}</div>
        {!this.props.nameOnly &&
        <>
        <div className={styles.item_amount}>{this.props.amount}</div>
        <div className={styles.item_id}> {this.props.id}</div>
        </>}

      </div>
    );
  }
}
