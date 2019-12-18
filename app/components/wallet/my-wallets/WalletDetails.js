// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import PublicDeriverWithCachedMeta from '../../../domain/PublicDeriverWithCachedMeta';

import styles from './WalletDetails.scss';
import IconEyeOpen from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';

type Props = {|
    +text: string,
    +formattedWalletAmount?: BigNumber => string,
    +publicDeriver: null | PublicDeriverWithCachedMeta,
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean
|};

export default class WalletDetails extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined,
  };

  render() {
    const {
      text,
      formattedWalletAmount,
      publicDeriver,
      shouldHideBalance,
      onUpdateHideBalance
    } = this.props;

    const walletAmount = formattedWalletAmount ?
      publicDeriver && formattedWalletAmount(publicDeriver.amount)
      : null;

    const currency = ' ADA';

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.amount}>
            { publicDeriver && shouldHideBalance ?
              <span className={styles.hiddenAmount}>******</span> :
              walletAmount
            }
            {currency}
          </div>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onUpdateHideBalance}
          >
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
        </div>
        <h2 className={styles.text}>{text}</h2>
      </div>
    );
  }
}
