// @flow
// @flow
import { Component } from 'react';
import type { Node } from 'react';
import { observer } from 'mobx-react';
import { intlShape } from 'react-intl';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import styles from './QuickAccessWalletCard.scss'
import { getType } from '../../utils/walletInfo';
import { constructPlate } from './WalletCard';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { MultiToken } from '../../api/common/lib/MultiToken';
import { hiddenAmount } from '../../utils/strings';

@observer
export default class QuickAccessWalletCard extends Component<{||}> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  render(): Node {
    const { intl } = this.context;
    const { shouldHideBalance } = this.props;

    const [, iconComponent] = this.props.plate
      ? constructPlate(this.props.plate, 0, styles.icon)
      : [];

    const typeText = [getType(this.props.wallet.conceptualWallet)]
      .filter(text => text != null)
      .map(text => intl.formatMessage(text))
      .join(' - ');
    const totalAmount = this.getTotalAmount();


    return (
      <div className={styles.component}>
        <div className={styles.header}>
          <h5 className={styles.name}>{this.props.wallet.conceptualWalletName}</h5>
          {' ·  '}
          <div className={styles.type}>{typeText}</div>
        </div>
        <div className={styles.body}>
          <div>{iconComponent}</div>
          <div className={styles.content}>
            <div className={styles.amount}>
              {this.renderAmountDisplay({
                shouldHideBalance,
                amount: totalAmount,
              })}
            </div>
            <div className={styles.fixedAmount}>
              {this.renderAmountDisplay({
                shouldHideBalance,
                amount: totalAmount,
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

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