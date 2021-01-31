// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import DropdownCard from './DropdownCard';
import styles from './ConnectWebsitesPage.scss';

type Props = {|
  accounts: any,
  onRemoveWallet: string => void,
|};

export default class ConnectWebsitesPage extends Component<Props> {
  render(): Node {
    const { accounts, onRemoveWallet } = this.props;

    return (
      <div className={styles.component}>
        <h1 className={styles.title}>Connected Websites</h1>
        <div className={styles.walletList}>
          {accounts && accounts.length ? (
            accounts.map(({ url, wallet }) => (
              <DropdownCard url={url} wallet={wallet} onRemoveWallet={onRemoveWallet} />
            ))
          ) : (
            <p className={styles.noItems}>We havent found any wallet. Make sure ... </p>
          )}
        </div>
      </div>
    );
  }
}
