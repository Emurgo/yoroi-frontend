// @flow
import React, { Component } from 'react';
import type { Element, Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletRecoveryPhraseMnemonic.scss';

type Props = {|
  +phrase: string | Element<any>,
  +classicTheme: boolean,
  +filled?: boolean
|};

@observer
export default class WalletRecoveryPhraseMnemonic extends Component<Props> {
  static defaultProps: {|filled: void|} = {
    filled: undefined
  }

  render(): Node {
    const { phrase, filled } = this.props;
    const componentClasses = classnames([
      styles.component,
      filled === true ? styles.filled : ''
    ]);
    return (
      <div className={componentClasses}>{phrase}</div>
    );
  }

}
