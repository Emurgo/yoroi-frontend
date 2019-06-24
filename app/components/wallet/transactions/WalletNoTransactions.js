// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import styles from './WalletNoTransactions.scss';
import noTransactionClassicSvg from '../../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import noTransactionModernSvg from '../../../assets/images/transaction/no-transactions-yet.modern.inline.svg';

type Props = {|
  label: string,
  classicTheme: boolean,
|};

@observer
export default class WalletNoTransactions extends Component<Props> {

  render() {
    const { classicTheme } = this.props;
    const noTransactionSvg = classicTheme ? noTransactionClassicSvg : noTransactionModernSvg;
    return (
      <div className={styles.component}>
        <SvgInline className={styles.imageWrappper} svg={noTransactionSvg} />
        <div className={styles.label}>{this.props.label}</div>
      </div>
    );
  }
}
