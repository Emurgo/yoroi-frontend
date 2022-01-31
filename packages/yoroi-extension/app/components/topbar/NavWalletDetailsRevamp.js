// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import { splitAmount, truncateToken } from '../../utils/formatters';

import styles from './NavWalletDetailsRevamp.scss';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { hiddenAmount } from '../../utils/strings';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import WalletAccountIcon from './WalletAccountIcon';
import { calculateAndFormatValue } from '../../utils/unit-of-account';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

type Props = {|
  +onUpdateHideBalance: void => Promise<void>,
  +shouldHideBalance: boolean,
  +highlightTitle?: boolean,
  +showEyeIcon?: boolean,
  /**
   * undefined => wallet is not a reward wallet
   * null => still calculating
   * value => done calculating
   */
  +rewards: null | void | MultiToken,
  +walletAmount: null | MultiToken,
  +infoText?: string,
  +showDetails?: boolean,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +defaultToken: $ReadOnly<TokenRow>,
  +plate: null | WalletChecksum,
  +wallet: {|
    conceptualWallet: ConceptualWallet,
    conceptualWalletName: string,
  |},
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?number,
|};

function constructPlate(
  plate: WalletChecksum,
  saturationFactor: number,
  divClass: string
): [string, React$Element<'div'>] {
  return [
    plate.TextPart,
    <div className={divClass}>
      <WalletAccountIcon
        iconSeed={plate.ImagePart}
        saturationFactor={saturationFactor}
        scalePx={6}
      />
    </div>,
  ];
}

@observer
export default class NavWalletDetailsRevamp extends Component<Props> {
  static defaultProps: {|
    highlightTitle: boolean,
    infoText: void,
    showDetails: boolean,
    showEyeIcon: boolean,
  |} = {
    highlightTitle: false,
    infoText: undefined,
    showDetails: true,
    showEyeIcon: true,
  };

  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      highlightTitle,
      showEyeIcon,
      plate,
    } = this.props;

    const totalAmount = this.getTotalAmount();

    const showEyeIconSafe = showEyeIcon != null && showEyeIcon;

    const [, iconComponent] = plate ? constructPlate(plate, 0, styles.icon) : [];

    return (
      <div className={styles.wrapper}>
        <div className={styles.outerWrapper}>
          <div className={classnames([styles.currency])}>{iconComponent}</div>
          <div className={styles.content}>
            <div
              className={classnames([
                styles.amount,
                highlightTitle !== null && highlightTitle === true && styles.highlightAmount,
              ])}
            >
              {this.renderAmountDisplay({
                shouldHideBalance,
                amount: totalAmount,
              })}
            </div>
            {this.props.unitOfAccountSetting.enabled && (
              <div className={styles.fixedAmount}>
                {this.renderAmountWithUnitOfAccount({
                  shouldHideBalance,
                  amount: totalAmount,
                })}
              </div>
            )}
          </div>
          {totalAmount != null && showEyeIconSafe && (
            <button type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
              {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
            </button>
          )}
        </div>
      </div>
    );
  }

  getTotalAmount: void => null | MultiToken = () => {
    if (this.props.rewards === undefined) {
      return this.props.walletAmount;
    }
    if (this.props.rewards === null || this.props.walletAmount === null) {
      return null;
    }
    return this.props.rewards.joinAddCopy(this.props.walletAmount);
  };

  renderAmountDisplay: ({|
    shouldHideBalance: boolean,
    amount: ?MultiToken,
  |}) => Node = request => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
        shiftedAmount,
        tokenInfo.Metadata.numberOfDecimals
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    return (
      <>
        {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
      </>
    );
  };

  renderAmountWithUnitOfAccount: {|
    shouldHideBalance: boolean,
    amount: ?MultiToken
  |} => Node = (request) => {
    if (request.amount == null) {
      return null;
    }
    const { currency } = this.props.unitOfAccountSetting;
    if (currency == null) {
      throw new Error(`unexpected unit of account ${String(currency)}`);
    }
    if (request.shouldHideBalance) {
      return (
        <>
          <span>{hiddenAmount}</span>
          {` ${currency}`}
        </>
      );
    }
    let balanceDisplay;
    const defaultEntry = request.amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);
    const shiftedAmount = defaultEntry.amount
          .shiftedBy(-tokenInfo.Metadata.numberOfDecimals);
    const ticker = tokenInfo.Metadata.ticker;
    if (ticker == null) {
      throw new Error('unexpected main token type');
    }
    const price = this.props.getCurrentPrice(ticker, currency);
    if (price != null) {
      return `${calculateAndFormatValue(shiftedAmount, price)} ${currency}`;
    }
    return null;
  }
}
