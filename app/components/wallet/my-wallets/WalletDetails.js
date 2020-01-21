// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import PublicDeriverWithCachedMeta from '../../../domain/PublicDeriverWithCachedMeta';
import { DECIMAL_PLACES_IN_ADA } from '../../../config/numbersConfig';

import styles from './WalletDetails.scss';
import IconEyeOpen from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';

type Props = {|
    +formattedWalletAmount?: BigNumber => string,
    +publicDeriver: null | PublicDeriverWithCachedMeta,
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean
|};

function splitAmount(
  value: string | null,
  index: number,
): ([string | null, string | null]) {
  if (value !== null) {
    const startIndex = value.length - index;
    return [value.substring(0, startIndex), value.substring(startIndex)];
  }
  return [null, null];
}

export default class WalletDetails extends Component<Props> {
  static defaultProps = {
    formattedWalletAmount: undefined,
  };

  render() {
    const {
      formattedWalletAmount,
      publicDeriver,
      shouldHideBalance,
      onUpdateHideBalance
    } = this.props;

    const walletAmount = formattedWalletAmount ? (
      publicDeriver && formattedWalletAmount(publicDeriver.amount)
    ) : null;

    const [
      beforeDecimal, afterDecimal
    ]:([string | null, string | null])  = splitAmount(walletAmount, DECIMAL_PLACES_IN_ADA);

    const currency = ' ADA';

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={styles.amount}>
            { publicDeriver && shouldHideBalance ?
              <span className={styles.hiddenAmount}>******</span> :
              <>
                {beforeDecimal}
                <span className={styles.afterDecimal}>{afterDecimal}</span>
              </>
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
      </div>
    );
  }
}
