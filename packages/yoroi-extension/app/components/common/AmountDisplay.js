// @flow
import { Component } from 'react';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { hiddenAmount } from '../../utils/strings';
import styles from './AmountDisplay.scss';
import type { MultiToken, TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { Node } from 'react';

type Props = {|
  +showAmount?: boolean,
  +showFiat?: boolean,
  +shouldHideBalance: boolean,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +amount?: null | MultiToken,
|}
export default class AmountDisplay extends Component<Props> {
  static defaultProps: {| showAmount: boolean, showFiat: boolean, amount: null | MultiToken |} = {
    showAmount: true,
    showFiat: false,
    amount: null,
  };

  render(): Node {
    const { amount, shouldHideBalance, showFiat, showAmount } = this.props
    if (amount == null) {
        return <div className={styles.isLoading} />;
      }

      const defaultEntry = amount.getDefaultEntry();
      const tokenInfo = this.props.getTokenInfo(defaultEntry);
      const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

      let balanceDisplay;
      if (shouldHideBalance) {
        balanceDisplay = <span>{hiddenAmount}</span>;
      } else {
        const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(
          shiftedAmount,
          tokenInfo.Metadata.numberOfDecimals
        );

        balanceDisplay = (
          <>
            {beforeDecimalRewards}
            <span>{afterDecimalRewards}</span>
          </>
        );
      }

      return (
        <>
          {showAmount === true &&
          <p className={styles.amount}>
            {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
          </p>}
          {showFiat === true &&
          <p className={styles.fiat}>
            {balanceDisplay} USD
          </p>}
        </>
      );
  }
};