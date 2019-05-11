// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import Wallet from '../../domain/Wallet';
import WalletAccountIcon from "./WalletAccountIcon";
import { WalletTypeOption } from "../../types/WalletType";

type Props = {
  wallet: ?Wallet,
  currentRoute: string,
  formattedWalletAmount?: Function,
  theme: { identiconSaturationFactor: number },
};

function constructPlate(account, saturationFactor, divClass): [string, React$Element<any>] {
  const { plate: { hash, id } } = account;
  return [id, (<div className={divClass}>
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

    const isHardwareWallet = (wallet && wallet.type) === WalletTypeOption.HARDWARE_WALLET;
    const iconDivClass = isHardwareWallet ? styles.divIconHardware : styles.divIcon;
    const [accountPlateId, iconComponent] = (wallet && wallet.accounts) ?
      constructPlate(wallet.accounts[0], theme.identiconSaturationFactor, iconDivClass)
      : [];

    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        {iconComponent}
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>{wallet && wallet.name}</div>
          <div className={styles.walletPlate}>{accountPlateId || ''}</div>
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
