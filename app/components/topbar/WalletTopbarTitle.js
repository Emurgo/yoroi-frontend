// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import LoadingSpinner from '../widgets/LoadingSpinner';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import WalletAccountIcon from './WalletAccountIcon';

import { defineMessages, intlShape } from 'react-intl';
import HideBalanceIcon from '../../assets/images/top-bar/password.hide.inline.svg';
import ShowBalanceIcon from '../../assets/images/top-bar/password.show.inline.svg';
import PublicDeriverWithCachedMeta from '../../domain/PublicDeriverWithCachedMeta';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import type { WalletAccountNumberPlate } from '../../api/ada/lib/storage/models/PublicDeriver/interfaces';

const messages = defineMessages({
  totalBalance: {
    id: 'wallet.topbar.totalbalance',
    defaultMessage: '!!!Total balance',
  },
});

type Props = {|
  +publicDeriver: null | PublicDeriverWithCachedMeta,
  +currentRoute: string,
  +formattedWalletAmount?: BigNumber => string,
  +themeProperties?: {|
    identiconSaturationFactor: number,
  |},
  +onUpdateHideBalance: void => PossiblyAsync<void>,
  +shouldHideBalance: boolean,
|};

function constructPlate(
  plate: WalletAccountNumberPlate,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.id, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.hash}
        saturationFactor={saturationFactor}
      />
    </div>
  )];
}

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletTopbarTitle extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined,
    themeProperties: {
      identiconSaturationFactor: 0,
    },
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const {
      publicDeriver, currentRoute, formattedWalletAmount, themeProperties,
      shouldHideBalance, onUpdateHideBalance
    } = this.props;
    const { identiconSaturationFactor } = themeProperties || {};
    const { intl } = this.context;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = (walletRoutesMatch !== false) && (publicDeriver != null);

    const isHardwareWallet = publicDeriver != null &&
      publicDeriver.self.getParent().getWalletType() === WalletTypeOption.HARDWARE_WALLET;
    const currency = ' ADA';
    const iconDivClass = isHardwareWallet ? styles.divIconHardware : styles.divIcon;
    const [accountPlateId, iconComponent] = (publicDeriver && publicDeriver.plate) ?
      constructPlate(publicDeriver.plate, identiconSaturationFactor, iconDivClass)
      : [];

    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        {iconComponent}
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>
            { publicDeriver && publicDeriver.conceptualWalletName }
          </div>
          <div className={styles.walletPlate}>{accountPlateId || ''}</div>
        </div>
        <div className={styles.divAmount}>
          {publicDeriver?.amount != null
            ? (
              <div className={styles.walletAmount}>
                { publicDeriver && shouldHideBalance ?
                  <span className={styles.hiddenWalletAmount}>******</span> :
                  publicDeriver && formattedWalletAmount(publicDeriver.amount)
                }
                { currency }
              </div>
            )
            : (
              <LoadingSpinner small light />
            )
          }
          <div className={styles.walletAmountLabelBlock}>
            <div className={styles.walletAmountLabel}>
              {intl.formatMessage(messages.totalBalance)}
            </div>
            <div>
              <button
                type="button"
                onClick={onUpdateHideBalance}
                className={classNames([styles.hideBalanceButton, 'hideBalanceButton'])}
              >
                <span className={styles.showHideBalanceIcon}>
                  {shouldHideBalance
                    ? <ShowBalanceIcon />
                    : <HideBalanceIcon />
                  }
                </span>
              </button>
            </div>
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
