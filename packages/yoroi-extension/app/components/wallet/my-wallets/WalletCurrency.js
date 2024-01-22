// @flow
import { observer } from 'mobx-react';
import { Component } from 'react';
import type { Node } from 'react';
import styles from './WalletCurrency.scss';

import { ReactComponent as SymbolADA }  from '../../../assets/images/my-wallets/symbol_ada.inline.svg';
import { ReactComponent as SymbolTADA }  from '../../../assets/images/my-wallets/symbol_adaTestnet.inline.svg';
import { ReactComponent as SymbolBTC }  from '../../../assets/images/my-wallets/symbol_bitcoin.inline.svg';
import { ReactComponent as SymbolETH }  from '../../../assets/images/my-wallets/symbol_ethereum.inline.svg';

type Props = {|
  +currency: string,

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
      case 'TADA':
        Icon = SymbolTADA;
        break;
      case 'BTC':
        Icon = SymbolBTC;
        break;
      case 'ETH':
        Icon = SymbolETH;
        break;
      default:
        throw new Error(`${nameof(WalletCurrency)} unknown ticker ${currency}`);
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
