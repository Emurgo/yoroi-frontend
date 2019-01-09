// @flow
import React, { Component } from 'react';
import type { Element } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletRecoveryPhraseMnemonic.scss';

type Props = {
  phrase: string | Element<any>,
  oldTheme: boolean,
  filled?: boolean
};

@observer
export default class WalletRecoveryPhraseMnemonic extends Component<Props> {
  static defaultProps = {
    filled: undefined
  }

  render() {
    const { phrase, oldTheme, filled } = this.props;
    const componentClasses = classnames([
      oldTheme ? styles.componentOld : styles.component,
      filled ? styles.filled : ''
    ]);
    return (
      <div className={componentClasses}>{phrase}</div>
    );
  }

}
