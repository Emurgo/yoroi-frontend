// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import styles from './WalletNavButton.scss';
import TransactionImageActive from '../../../assets/images/wallet-nav/transactions.active.inline.svg'

type Props = {|
  +label: string,
  +icon?: string,
  +isActive: boolean,
  +onClick: void => void,
  +className?: string,
|};

@observer
export default class WalletNavButton extends Component<Props> {
  static defaultProps: {|className: void, icon: void|} = {
    className: undefined,
    icon: undefined
  };

  render(): Node {
    const { isActive, onClick, className, label, icon } = this.props;

    const IconComponent = icon;

    const componentClasses = classnames([
      className,
      styles.button,
      isActive && styles.active
    ]);

    return (
      <button type="button" className={componentClasses} onClick={onClick}>
        {IconComponent != null &&
          <div className={styles.icon}>
            {
              label === 'Transactions' && isActive ?
              <TransactionImageActive />
              : <IconComponent />
            }
          </div>
        }
        <span className={styles.label}>{label}</span>
      </button>
    );
  }
}
