// @flow
import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import type { Node } from 'react';
import classnames from 'classnames';
import { intlShape, } from 'react-intl';
import { DECIMAL_PLACES_IN_ADA } from '../../config/numbersConfig';
import { formattedWalletAmount } from '../../utils/formatters';

import globalMessages from '../../i18n/global-messages';
import styles from './NavWalletDetails.scss';
import IconEyeOpen from '../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../assets/images/my-wallets/icon_eye_closed.inline.svg';

type Props = {|
    +onUpdateHideBalance: void => void,
    +shouldHideBalance: boolean,
    +highlightTitle?: boolean,
    /**
      * undefined => wallet doesn't is not a reward wallet
      * null => still calculating
      * value => done calculating
    */
    +rewards: null | void | BigNumber,
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

    const totalAmount = this.getTotalAmount();
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
              amount: totalAmount
            })}
          </div>
          {this.props.rewards !== undefined &&
          <div className={styles.details}>
            <div>
              <p className={styles.label}>{intl.formatMessage(globalMessages.walletLabel)}&nbsp;</p>
              {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
            </div>
            <div>
              <p className={styles.label}>{intl.formatMessage(globalMessages.rewardsLabel)}&nbsp;</p>
              {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
            </div>
          </div>
        }
        </div>
        {totalAmount != null &&
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onUpdateHideBalance}
          >
            {shouldHideBalance ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
        }
      </div>
    );
  }

  getTotalAmount: void => (null | BigNumber) = () => {
    if (this.props.rewards === undefined) {
      return this.props.walletAmount;
    }
    if (this.props.rewards === null || this.props.walletAmount === null) {
      return null;
    }
    return this.props.rewards.plus(this.props.walletAmount);
  }

  renderAmountDisplay: {|
    shouldHideBalance: boolean,
    amount: ?BigNumber
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
