// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import Wallet from '../../domain/Wallet';
import Blockies from 'react-blockies';

type Props = {
  wallet: ?Wallet,
  currentRoute: string,
  formattedWalletAmount?: Function
};

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletTopbarTitle extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined
  };

  render() {
    const {
      wallet, currentRoute, formattedWalletAmount
    } = this.props;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && wallet;
    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.divIcon}>
          <Blockies
            seed={`${Math.random()}`}
            size={7}
            scale={7}
            bgColor='#55ff00'
            color='#dd01fa'
            spotColor='#000'
            className={styles.walletIcon}
          />
        </div>
        <div className={styles.divPlate}>
          <div className={styles.walletPlate}>ABCD</div>
          <div className={styles.walletPlate}>1234</div>
        </div>
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>{wallet && wallet.name}</div>
          <div className={styles.walletAmount}>
            { wallet && formattedWalletAmount(wallet.amount) + ' ADA' }
          </div>
        </div>
      </div>
    ) : null;

    const topBarStyles = classNames([
      showWalletInfo ? styles.withWallet : styles.withoutWallet,
    ]);

    return (<div className={topBarStyles}>{topbarTitle}</div>);
  }
}
