// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import BigNumber from 'bignumber.js';
import classnames from 'classnames';
import { intlShape, defineMessages } from 'react-intl';
import { DECIMAL_PLACES_IN_ADA } from '../../../config/numbersConfig';
import { formattedWalletAmount } from '../../../utils/formatters';

import styles from './WalletDetails.scss';
import IconEyeOpen from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';

const messages = defineMessages({
  totalLabel: {
    id: 'wallet.details.sumLabel.total',
    defaultMessage: '!!!Total',
  },
  walletLabel: {
    id: 'wallet.details.sumLabel.wallet',
    defaultMessage: '!!!Wallet',
  },
  rewardsLabel: {
    id: 'wallet.details.sumLabel.rewards',
    defaultMessage: '!!!Rewards',
  },
});

type Props = {|
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean,
    +rewards: null | BigNumber,
    +walletAmount: null | BigNumber,
    +infoText?: string,
|};

type SplitDecimalProps = [string, string];

function splitAmount(
  value: string,
  index: number,
): SplitDecimalProps {
  const startIndex = value.length - index;
  return [value.substring(0, startIndex), value.substring(startIndex)];
}

export default class WalletDetails extends Component<Props> {

  static defaultProps = {
    infoText: undefined,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      walletAmount,
      rewards
    } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          <div className={classnames([styles.amount, styles.amountBold])}>
            {this.renderAmountDisplay({
              shouldHideBalance,
              amount: walletAmount != null && rewards != null
                ? walletAmount.plus(rewards)
                : null
            })}
            <span className={styles.amountLabel}>{intl.formatMessage(messages.totalLabel)}</span>
          </div>
          <div className={styles.amount}>
            {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
            <span className={styles.amountLabel}>{intl.formatMessage(messages.walletLabel)}</span>
          </div>
          <div className={styles.amount}>
            {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
            <span className={styles.amountLabel}>{intl.formatMessage(messages.rewardsLabel)}</span>
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
