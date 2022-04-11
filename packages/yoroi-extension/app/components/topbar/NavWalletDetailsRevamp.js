// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape } from 'react-intl';
import { truncateLongName } from '../../utils/formatters';

import styles from './NavWalletDetailsRevamp.scss';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { WalletChecksum } from '@emurgo/cip4-js';
import type { ConceptualWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import WalletAccountIcon from './WalletAccountIcon';
import AmountDisplay from '../common/AmountDisplay';

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
      showEyeIcon,
      plate,
    } = this.props;

    const totalAmount = this.getTotalAmount();

    const showEyeIconSafe = showEyeIcon != null && showEyeIcon;

    const [accountPlateId, iconComponent] = plate ? constructPlate(plate, 0, styles.icon) : [];
    return (
      <div className={styles.wrapper}>
        <div className={styles.outerWrapper}>
          <div className={styles.contentWrapper}>
            <div className={classnames([styles.currency])}>{iconComponent}</div>
            <div className={styles.content}>
              <div className={styles.walletInfo}>
                <p className={styles.name}>
                  {truncateLongName(this.props.wallet.conceptualWalletName)}
                </p>
                <p className={styles.plateId}>{accountPlateId}</p>
              </div>
              <div className={styles.balance}>
                <div
                  className={classnames([
                    totalAmount ? styles.amount : styles.spinnerWrapper,
                  ])}
                >
                  <AmountDisplay
                    shouldHideBalance={shouldHideBalance}
                    amount={totalAmount}
                    getTokenInfo={this.props.getTokenInfo}
                    showFiat
                  />
                </div>
              </div>
            </div>
          </div>
          <button disabled={totalAmount === null && !showEyeIconSafe} type="button" className={styles.toggleButton} onClick={onUpdateHideBalance}>
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
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
}
