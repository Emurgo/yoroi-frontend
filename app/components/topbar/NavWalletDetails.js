// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape, defineMessages } from 'react-intl';
import { DECIMAL_PLACES_IN_ADA } from '../../config/numbersConfig';
import { formattedWalletAmount } from '../../utils/formatters';

import styles from './NavWalletDetails.scss';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';

type Props = {|
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean,
    +highlightTitle?: boolean,
    +rewards: null | BigNumber,
    +walletAmount: null | BigNumber,
|};

type SplitDecimalProps = [string, string];

function splitAmount(
  value: string,
  index: number,
): SplitDecimalProps {
  const startIndex = value.length - index;
  return [value.substring(0, startIndex), value.substring(startIndex)];
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

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div
            className={classnames([
              styles.amount,
              highlightTitle !== null && highlightTitle === true && styles.highlightAmount
            ])}
          >
            {this.renderAmountDisplay({
              shouldHideBalance,
              amount: walletAmount != null && rewards != null
                ? walletAmount.plus(rewards)
                : null
            })}
          </div>
          <div className={styles.details}>
            <div>
              <p className={styles.label}>{intl.formatMessage(messages.walletLabel)}&nbsp;</p>
              {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
            </div>
            <div>
              <p className={styles.label}>{intl.formatMessage(messages.rewardsLabel)}&nbsp;</p>
              {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
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

  renderAmountDisplay: {|
    shouldHideBalance: boolean,
    amount: BigNumber | null
  |} => Node = (request) => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = (<span>******</span>);
    } else {
      const [beforeDecimalRewards, afterDecimalRewards]: SplitDecimalProps = splitAmount(
        formattedWalletAmount(request.amount),
        DECIMAL_PLACES_IN_ADA
      );

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span className={styles.afterDecimal}>{afterDecimalRewards}</span>
        </>
      );
    }

    const currency = ' ADA'; // TODO: get from variable

    return (<>{balanceDisplay} {currency}</>);
  }
}
