// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import styles from './WalletNoTransactions.scss';
import noTransactionSvg from '../../../assets/images/transaction/no-transactions-yet.inline.svg';

type Props = {
  label: string,
  isClassicThemeActive: boolean
};

@observer
export default class WalletNoTransactions extends Component<Props> {

  render() {
    const { isClassicThemeActive } = this.props;
    return (
      <div className={isClassicThemeActive ? styles.componentClassic : styles.component}>
        {!isClassicThemeActive &&
          <SvgInline className={styles.imageWrappper} svg={noTransactionSvg} />}
        <div className={styles.label}>{this.props.label}</div>
      </div>
    );
  }
}
