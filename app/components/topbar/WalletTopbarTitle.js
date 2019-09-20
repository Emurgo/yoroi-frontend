// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import SvgInline from 'react-svg-inline';
import classNames from 'classnames';
import styles from './WalletTopbarTitle.scss';
import { matchRoute } from '../../utils/routing';
import { ROUTES } from '../../routes-config';
import Wallet from '../../domain/Wallet';
import WalletAccountIcon from './WalletAccountIcon';
import { WalletTypeOption } from '../../types/WalletType';
import type { WalletAccount } from '../../domain/Wallet';
import { defineMessages, intlShape } from 'react-intl';
import hideBalanceIcon from '../../assets/images/top-bar/password.hide.inline.svg';
import showBalanceIcon from '../../assets/images/top-bar/password.show.inline.svg';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../utils/unit-of-account';

const messages = defineMessages({
  totalBalance: {
    id: 'wallet.topbar.totalbalance',
    defaultMessage: '!!!Total balance',
  },
});

type Props = {|
  wallet: ?Wallet,
  account: ?WalletAccount,
  currentRoute: string,
  formattedWalletAmount?: Function,
  themeProperties?: {
    identiconSaturationFactor: number,
  },
  onUpdateHideBalance: Function,
  shouldHideBalance: boolean,
  unitOfAccountSetting: UnitOfAccountSettingType,
  coinPrice: ?number,
|};

function constructPlate(account, saturationFactor, divClass): [string, React$Element<'div'>] {
  const { plate: { hash, id } } = account;
  return [id, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={hash}
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
      wallet, coinPrice, account, currentRoute, formattedWalletAmount, themeProperties,
      shouldHideBalance, onUpdateHideBalance, unitOfAccountSetting
    } = this.props;
    const { identiconSaturationFactor } = themeProperties || {};
    const { intl } = this.context;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = walletRoutesMatch && wallet;

    const isHardwareWallet = (wallet && wallet.type) === WalletTypeOption.HARDWARE_WALLET;
    const currency = 'ADA';
    const iconDivClass = isHardwareWallet ? styles.divIconHardware : styles.divIcon;
    const [accountPlateId, iconComponent] = account ?
      constructPlate(account, identiconSaturationFactor, iconDivClass)
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
            {wallet && shouldHideBalance ? ( // eslint-disable-line no-nested-ternary
              <span className={styles.hiddenWalletAmount}>******</span>
            ) : unitOfAccountSetting.enabled ? ( // eslint-disable-line no-nested-ternary
              wallet ? (
                <span>
                  {coinPrice ? calculateAndFormatValue(wallet.amount, coinPrice) : '-'}
                </span>
              ) : null
            ) : (
              wallet ? formattedWalletAmount(wallet.amount) : null
            ) }
            {' ' + (unitOfAccountSetting.enabled ?
              unitOfAccountSetting.currency : currency)
            }
          </div>
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
                <SvgInline
                  svg={shouldHideBalance ? showBalanceIcon : hideBalanceIcon}
                  className={styles.showHideBalanceIcon}
                />
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
