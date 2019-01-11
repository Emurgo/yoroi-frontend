// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import styles from './WalletNoTransactions.scss';
import noTransactionSvg from '../../../assets/images/transaction/no-transactions-yet.inline.svg';

type Props = {
  label: string,
  oldTheme: boolean
};

@observer
export default class WalletNoTransactions extends Component<Props> {

  render() {
    const { oldTheme } = this.props;
    return (
      <div className={oldTheme ? styles.componentOld : styles.component}>
        {!oldTheme && <SvgInline className={styles.imageWrappper} svg={noTransactionSvg} cleanup={['title']} />}
        <div className={styles.label}>{this.props.label}</div>
      </div>
    );
  }
}
