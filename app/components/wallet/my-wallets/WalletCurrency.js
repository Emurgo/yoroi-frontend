// @flow
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import type { Node } from 'react';
import styles from './WalletCurrency.scss';

import SymbolADA from '../../../assets/images/my-wallets/symbol_ada.inline.svg';
import SymbolBTC from '../../../assets/images/my-wallets/symbol_bitcoin.inline.svg';
import SymbolETH from '../../../assets/images/my-wallets/symbol_ethereum.inline.svg';

type Props = {|
  +currency: 'ADA' | 'BTC' | 'ETH',
  +tooltipText?: string | null,
|};

@observer
export default class WalletCurrency extends Component<Props> {
  static defaultProps: {|tooltipText: null|} = {
    tooltipText: null,
  };

  render(): Node {
    const { currency, tooltipText } = this.props;

    let Icon;

    switch (currency) {
      case 'ADA':
        Icon = SymbolADA;
        break;
      case 'BTC':
        Icon = SymbolBTC;
        break;
      case 'ETH':
        Icon = SymbolETH;
        break;
      default:
        Icon = SymbolADA;
        break;
    }

    return (
      <div className={styles.wrapper}>
        <div className={styles.icon}>
          <Icon />
        </div>
        {tooltipText != null && (
          <div className={styles.content}>{tooltipText}</div>
        )}
      </div>
    );
  }
}
