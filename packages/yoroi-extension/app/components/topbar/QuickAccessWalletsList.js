// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import QuickAccessListheader from './QuickAccessListHeader';
import styles from './QuickAccessWalletsList.scss'
import QuickAccessWalletCard from './QuickAccessWalletCard';

type Props = {|
  wallets: Array<Object>
|}
@observer
export default class QuickAccessWalletsList extends Component<Props> {
    render(): Node {
        return (
          <div className={styles.component}>
            <QuickAccessListheader />
            <div className={styles.walletsList}>
              {this.props.wallets.map(wallet => <QuickAccessWalletCard {...wallet} />)}
            </div>
          </div>
        )
    }
}