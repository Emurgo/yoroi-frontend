// @flow
import React, { Component } from 'react';
import type { Element } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletRecoveryPhraseMnemonic.scss';

type Props = {
  phrase: string | Element<any>,
  classicTheme: boolean,
  filled?: boolean
};

@observer
export default class WalletRecoveryPhraseMnemonic extends Component<Props> {
  static defaultProps = {
    filled: undefined
  }

  render() {
    const { phrase, classicTheme, filled } = this.props;
    const componentClasses = classnames([
      classicTheme ? styles.componentClassic : styles.component,
      filled ? styles.filled : ''
    ]);
    return (
      <div className={componentClasses}>{phrase}</div>
    );
  }

}
