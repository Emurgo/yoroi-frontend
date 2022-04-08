// @flow
import { Component } from 'react';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { hiddenAmount } from '../../utils/strings';
import styles from './AmountDisplay.scss'

export default class AmountDisplay extends Component<> {
    render() {
        const { amount, shouldHideBalance } = this.props
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
              {balanceDisplay} {truncateToken(getTokenName(tokenInfo))}
            </>
          );
    }
}