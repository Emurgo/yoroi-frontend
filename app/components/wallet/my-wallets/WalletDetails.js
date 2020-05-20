// @flow
import React, { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
// import classnames from 'classnames';
import { intlShape } from 'react-intl';
import globalMessages from '../../../i18n/global-messages';
import { splitAmount } from '../../../utils/formatters';
import styles from './WalletDetails.scss';
import IconEyeOpen from '../../../assets/images/my-wallets/icon_eye_open.inline.svg';
import IconEyeClosed from '../../../assets/images/my-wallets/icon_eye_closed.inline.svg';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';

type Props = {|
    +onUpdateHideBalance: void => Promise<void>,
    +shouldHideBalance: boolean,
    /**
      * undefined => wallet is not a reward wallet
      * null => still calculating
      * value => done calculating
    */
    +rewards: null | void | BigNumber,
    +walletAmount: null | BigNumber,
    +infoText?: string,
|};

@observer
export default class WalletDetails extends Component<Props> {

  static defaultProps: {|infoText: void|} = {
    infoText: undefined,
  };

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const {
      shouldHideBalance,
      onUpdateHideBalance,
      walletAmount,
      // rewards
    } = this.props;

    return (
      <div className={styles.wrapper}>
        <div className={styles.content}>
          {/* <div className={classnames([styles.amount, styles.amountBold])}>
            {this.renderAmountDisplay({
              shouldHideBalance,
              amount: walletAmount != null && rewards != null
                ? walletAmount.plus(rewards)
                : null
            })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.walletSendConfirmationTotalLabel)}
            </span>
          </div> */}
          <div className={styles.amount}>
            {this.renderAmountDisplay({ shouldHideBalance, amount: walletAmount })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.walletLabel)}
            </span>
          </div>
          {/* <div className={styles.amount}>
            {this.renderAmountDisplay({ shouldHideBalance, amount: rewards })}
            <span className={styles.amountLabel}>
              {intl.formatMessage(globalMessages.rewardsLabel)}
            </span>
          </div> */}
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
    amount: ?BigNumber
  |} => Node = (request) => {
    if (request.amount == null) {
      return <div className={styles.isLoading} />;
    }

    let balanceDisplay;
    if (request.shouldHideBalance) {
      balanceDisplay = (<span>******</span>);
    } else {
      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(request.amount);

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
