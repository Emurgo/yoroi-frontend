// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import Wallet from '../../domain/Wallet';
import Blockies from 'react-blockies';
import tinycolor from 'tinycolor2';

type Props = {
  wallet: ?Wallet,
  currentRoute: string,
  formattedWalletAmount?: Function,
  theme: { identiconSaturationFactor: number },
};

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#f06ef5', '#0804f7'),
  mkcolor('#E1F2FF', '#ebb687', '#852d62'),
  mkcolor('#E1F2FF', '#eda9a5', '#43327a'),
];

const saturation = (color, factor: number = 10) => {
  if (factor < 0 || factor > 20) {
    throw Error("Expected factor between 0 and 20 (default 10)")
  }
  const diff = factor - 10;
  let tcol = tinycolor(color);
  for (let i = 0; i < Math.abs(diff); i++) {
    tcol = diff < 0 ?
      tcol.desaturate()
      : tcol.saturate();
  }
  return tcol.toHexString();
};

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

    const [{ plate: { hash: accountPlateHash, id: accountPlateId } }] = wallet.accounts;
    const colorIdx = Buffer.from(accountPlateHash, 'hex')[0] % COLORS.length;
    const color = COLORS[colorIdx];

    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        <div className={styles.divIcon}>
          <Blockies
            seed={accountPlateHash}
            size={7}
            scale={6}
            bgColor={saturation(color.primary, theme.identiconSaturationFactor)}
            color={saturation(color.secondary, theme.identiconSaturationFactor)}
            spotColor={saturation(color.spots, theme.identiconSaturationFactor)}
            className={styles.walletIcon}
          />
        </div>
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>{wallet && wallet.name}</div>
          <div className={styles.walletPlate}>[{accountPlateId}]</div>
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
