// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import ExpendIcon from '../../../assets/images/transaction/send-ic.inline.svg';
import IncomeIcon from '../../../assets/images/transaction/receive-ic.inline.svg';
import ExchangeIcon from '../../../assets/images/exchange-ic.inline.svg';
import FailedIcon from '../../../assets/images/transaction/deny-ic.inline.svg';
import styles from './TransactionTypeIcon.scss';

type Props = {|
  +iconType: string,
|};

@observer
export default class TransactionTypeIcon extends Component<Props> {

  render() {
    const { iconType } = this.props;

    const transactionTypeIconClasses = classNames([
      styles.transactionTypeIconWrapper,
      styles[iconType],
    ]);

    let Icon;
    switch (iconType) {
      case 'expend':
        Icon = ExpendIcon;
        break;
      case 'income':
        Icon = IncomeIcon;
        break;
      case 'exchange':
        Icon = ExchangeIcon;
        break;
      case 'failed':
        Icon = FailedIcon;
        break;
      default:
        Icon = '';
        break;
    }

    return (
      <div className={transactionTypeIconClasses}>
        <span className={styles.transactionTypeIcon}><Icon /></span>
      </div>
    );
  }
}
