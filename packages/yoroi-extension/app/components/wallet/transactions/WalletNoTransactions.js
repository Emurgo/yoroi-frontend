// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import styles from './WalletNoTransactions.scss';
import { ReactComponent as NoTransactionClassicSvg }  from '../../../assets/images/transaction/no-transactions-yet.classic.inline.svg';
import { ReactComponent as NoTransactionModernSvg }  from '../../../assets/images/transaction/no-transactions-yet.modern.inline.svg';

type Props = {|
  +label: string,
  +classicTheme: boolean,
|};

@observer
export default class WalletNoTransactions extends Component<Props> {

  render(): Node {
    const { classicTheme } = this.props;
    const NoTransactionSvg = classicTheme ? NoTransactionClassicSvg : NoTransactionModernSvg;
    return (
      <div className={styles.component}>
        <span className={styles.imageWrappper}><NoTransactionSvg /></span>
        <div className={styles.label}>{this.props.label}</div>
      </div>
    );
  }
}
