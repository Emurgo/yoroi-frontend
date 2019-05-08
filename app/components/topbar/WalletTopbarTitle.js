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

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#f06ef5', '#0804f7'),
  mkcolor('#E1F2FF', '#ebb687', '#852d62'),
  mkcolor('#E1F2FF', '#eda9a5', '#43327a'),
];

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
    const color = COLORS[Math.floor(Math.random()*5)];
    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.divIcon}>
          <Blockies
            seed={`${Math.random()}`}
            size={7}
            scale={6}
            bgColor={color.primary}
            color={color.secondary}
            spotColor={color.spots}
            className={styles.walletIcon}
          />
        </div>
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>{wallet && wallet.name}</div>
          <div className={styles.walletPlate}>[ABCD-1234]</div>
        </div>
        <div className={styles.divAmount}>
          <div className={styles.walletAmount}>
            { wallet && formattedWalletAmount(wallet.amount) + ' ADA' }
          </div>
          <div className={styles.walletAmountLabel}>Total balance</div>
        </div>
      </div>
    ) : null;

    const topBarStyles = classNames([
      showWalletInfo ? styles.withWallet : styles.withoutWallet,
    ]);

    return (<div className={topBarStyles}>{topbarTitle}</div>);
  }
}
