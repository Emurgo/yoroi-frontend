// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
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
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import type { WalletType } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

const messages = defineMessages({
  totalBalance: {
    id: 'wallet.topbar.totalbalance',
    defaultMessage: '!!!Total balance',
  },
});

type Props = {|
  +publicDeriver: null | PublicDeriver<>,
  +walletInfo: null | {|
    +type: WalletType,
    +plate: null | WalletChecksum,
    +conceptualWalletName: string,
    +amount: ?BigNumber,
  |},
  +currentRoute: string,
  +formattedWalletAmount?: BigNumber => string,
  +themeProperties?: {|
    identiconSaturationFactor: number,
  |},
  +onUpdateHideBalance: void => PossiblyAsync<void>,
  +shouldHideBalance: boolean,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +coinPrice: ?number,
|};

function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string,
): [string, React$Element<'div'>] {
  return [plate.TextPart, (
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
      />
    </div>
  )];
}

/** Dynamically generated title for the topbar when a wallet is selected */
@observer
export default class WalletTopbarTitle extends Component<Props> {
  static defaultProps: {|
    formattedWalletAmount: void,
    themeProperties: {|identiconSaturationFactor: number|},
  |} = {
    formattedWalletAmount: undefined,
    themeProperties: {
      identiconSaturationFactor: 0,
    },
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  getAmount: BigNumber => ?Node = (walletAmount) => {
    const {
      publicDeriver,
    } = this.props;
    if (publicDeriver == null) return undefined;
    if (this.props.shouldHideBalance) {
      return (<span className={styles.hiddenWalletAmount}>******</span>);
    }
    if (this.props.unitOfAccountSetting.enabled) {
      return (
        <span>
          {this.props.coinPrice != null
            ? calculateAndFormatValue(walletAmount, this.props.coinPrice)
            : '-'
          }
        </span>
      );
    }
    return this.props.formattedWalletAmount == null
      ? undefined
      : this.props.formattedWalletAmount(walletAmount);
  }

  render(): Node {
    const {
      walletInfo, currentRoute, formattedWalletAmount, themeProperties,
      shouldHideBalance, onUpdateHideBalance, unitOfAccountSetting,
    } = this.props;
    const { identiconSaturationFactor } = themeProperties || {};
    const { intl } = this.context;

    // If we are looking at a wallet, show its name and balance
    const walletRoutesMatch = matchRoute(`${ROUTES.WALLETS.ROOT}/:id(*page)`, currentRoute);
    const showWalletInfo = (walletRoutesMatch !== false) && (walletInfo != null);

    const isHardwareWallet = walletInfo != null &&
      walletInfo.type === WalletTypeOption.HARDWARE_WALLET;
    const currency = 'ADA';
    const iconDivClass = isHardwareWallet ? styles.divIconHardware : styles.divIcon;
    const [accountPlateId, iconComponent] = (walletInfo && walletInfo.plate) ?
      constructPlate(walletInfo.plate, identiconSaturationFactor, iconDivClass)
      : [];

    const topbarTitle = showWalletInfo && formattedWalletAmount ? (
      <div className={styles.walletInfo}>
        {iconComponent}
        <div className={styles.divWalletInfo}>
          <div className={styles.walletName}>
            { walletInfo && walletInfo.conceptualWalletName }
          </div>
          <div className={styles.walletPlate}>{accountPlateId || ''}</div>
        </div>
        <div className={styles.divAmount}>
          {walletInfo?.amount != null
            ? (
              <div className={styles.walletAmount}>
                {this.getAmount(walletInfo.amount)}
                {' '}
                {unitOfAccountSetting.enabled
                  ? unitOfAccountSetting.currency
                  : currency
                }
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
