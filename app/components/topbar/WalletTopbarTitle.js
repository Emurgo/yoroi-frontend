// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import Wallet from '../../domain/Wallet';
import WalletAccountIcon from "./WalletAccountIcon";

type Props = {
  wallet: ?Wallet,
  currentRoute: string,
  formattedWalletAmount?: Function,
  theme: { identiconSaturationFactor: number },
};

function constructPlate(account, saturationFactor): [string, Component] {
  const { plate: { hash, id } } = account;
  return [id, (<div className={styles.divIcon}>
    <WalletAccountIcon
      iconSeed={hash}
      saturationFactor={saturationFactor}
    />
  </div>)]
}

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletTopbarTitle extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined
  };

  render() {
    const {
      wallet, currentRoute, formattedWalletAmount, theme
    } = this.props;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && wallet;

    const [accountPlateId, iconComponent] = wallet.accounts ?
      constructPlate(wallet.accounts[0], theme.identiconSaturationFactor)
      : [];

    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        {iconComponent}
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>{wallet && wallet.name}</div>
          <div className={styles.walletPlate}>{accountPlateId ? `[${accountPlateId}]` : ''}</div>
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
