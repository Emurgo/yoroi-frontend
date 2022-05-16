// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { ReactComponent as ExpendIcon }  from '../../../assets/images/transaction/send-ic.inline.svg';
import { ReactComponent as IncomeIcon }  from '../../../assets/images/transaction/receive-ic.inline.svg';
import { ReactComponent as ExchangeIcon }  from '../../../assets/images/exchange-ic.inline.svg';
import { ReactComponent as FailedIcon }  from '../../../assets/images/transaction/deny-ic.inline.svg';
import styles from './TransactionTypeIcon.scss';

type Props = {|
  +iconType: string,
|};

@observer
export default class TransactionTypeIcon extends Component<Props> {

  render(): Node {
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
