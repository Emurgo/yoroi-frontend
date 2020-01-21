// @flow
import React, { Component } from 'react';
import classnames from 'classnames';
import { intlShape, defineMessages } from 'react-intl';
import { DECIMAL_PLACES_IN_ADA } from '../../config/numbersConfig';

import styles from './NavWalletDetails.scss';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';

type Props = {|
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean,
    +highlightTitle?: boolean,
    +rewards: string,
    +walletAmount: null | string,
|};

type SplitDecimalProps = ([string | null, string | null]);

function splitAmount(
  value: string | null,
  index: number,
): SplitDecimalProps {
  if (value !== null && value !== undefined) {
    const startIndex = value.length - index;
    return [value.substring(0, startIndex), value.substring(startIndex)];
  }
  return [null, null];
}

const messages = defineMessages({
  walletLabel: {
    id: 'wallet.nav.sumLabel.wallet',
    defaultMessage: '!!!Wallet',
  },
  rewardsLabel: {
    id: 'wallet.nav.sumLabel.rewards',
    defaultMessage: '!!!Rewards',
  },
});

export default class NavWalletDetails extends Component<Props> {

  static defaultProps = {
    highlightTitle: false,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {

    const {
      shouldHideBalance,
      onUpdateHideBalance,
      highlightTitle,
      rewards,
      walletAmount,
    } = this.props;

    const { intl } = this.context;

    const [beforeDecimalWallet, afterDecimalWallet]: SplitDecimalProps =
      splitAmount(walletAmount, DECIMAL_PLACES_IN_ADA);

    const [beforeDecimalRewards, afterDecimalRewards]: SplitDecimalProps =
    splitAmount(rewards, DECIMAL_PLACES_IN_ADA);

    const currency = ' ADA';

    const walletAmountSection = (
      shouldHideBalance ?
        <span>{walletAmount}</span> :
        <>
          {beforeDecimalWallet}
          <span className={styles.afterDecimal}>{afterDecimalWallet}</span>
        </>
    );

    const rewardsAmountSection = (
      shouldHideBalance ?
        <span>{walletAmount}</span> :
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
    );

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div
            className={classnames([
              styles.amount,
              highlightTitle !== null && highlightTitle === true && styles.highlightAmount
            ])}
          >
            {walletAmountSection} {currency}
          </div>
          <div className={styles.details}>
            <div>
              <p className={styles.label}>{intl.formatMessage(messages.walletLabel)}&nbsp;</p>
              {walletAmountSection} {currency}
            </div>
            <div>
              <p className={styles.label}>{intl.formatMessage(messages.rewardsLabel)}&nbsp;</p>
              {rewardsAmountSection} {currency}
            </div>
          </div>
        </div>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onUpdateHideBalance}
        >
          {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
        </button>
      </div>
    );
  }
}
