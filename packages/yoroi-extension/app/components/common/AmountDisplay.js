// @flow
import { BigNumber } from 'bignumber.js';
import { observer } from 'mobx-react';
import type { Node } from 'react';
import { Component } from 'react';
import type { MultiToken } from '../../api/common/lib/MultiToken';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { hiddenAmount } from '../../utils/strings';
import { calculateAndFormatValue, formatValue } from '../../utils/unit-of-account';
import styles from './AmountDisplay.scss';

type Props = {|
  +showAmount?: boolean,
  +showFiat?: boolean,
  +shouldHideBalance: boolean,
  +getTokenInfo: ($ReadOnly<Inexact<TokenLookupKey>>) => $ReadOnly<TokenRow>,
  +amount: ?MultiToken,
  +unitOfAccountSetting: UnitOfAccountSettingType,
  +getCurrentPrice: (from: string, to: string) => ?string,
  id: string,
|};

@observer
export default class AmountDisplay extends Component<Props> {
  static defaultProps: {| showAmount: boolean, showFiat: boolean |} = {
    showAmount: true,
    showFiat: false,
  };

  render(): Node {
    const { amount, shouldHideBalance, showFiat, showAmount, unitOfAccountSetting, id } = this.props;
    if (amount == null) {
      return <div className={styles.isLoading} />;
    }

    let balanceDisplay;
    let fiatDisplay;

    const defaultEntry = amount.getDefaultEntry();
    const tokenInfo = this.props.getTokenInfo(defaultEntry);

    const { currency } = unitOfAccountSetting;

    if (shouldHideBalance) {
      balanceDisplay = <span>{hiddenAmount}</span>;
      fiatDisplay = (
        <span>
          {hiddenAmount} {currency}
        </span>
      );
    } else {
      const shiftedAmount = defaultEntry.amount.shiftedBy(-tokenInfo.Metadata.numberOfDecimals);

      const [beforeDecimalRewards, afterDecimalRewards] = splitAmount(shiftedAmount, tokenInfo.Metadata.numberOfDecimals);

      balanceDisplay = (
        <>
          {beforeDecimalRewards}
          <span>{afterDecimalRewards}</span>
        </>
      );

      if (unitOfAccountSetting.enabled) {
        const ticker = tokenInfo.Metadata.ticker;
        if (ticker == null) {
          throw new Error('unexpected main token type');
        }
        if (currency == null) {
          throw new Error(`unexpected unit of account ${String(currency)}`);
        }
        const price = this.props.getCurrentPrice(ticker, currency);
        if (price == null) {
          fiatDisplay = '-';
        } else {
          fiatDisplay = calculateAndFormatValue(shiftedAmount, price);
        }
      }
    }

    return (
      <>
        {showAmount === true && (
          <div className={styles.amount} id={id + '-availableBalance-text'}>
            {balanceDisplay}&nbsp;{truncateToken(getTokenName(tokenInfo))}
          </div>
        )}
        {showFiat === true && (
          <div className={styles.fiat} id={id + '-availableFiatBalance-text'}>
            {fiatDisplay || '-'} {currency || 'USD'}
          </div>
        )}
      </>
    );
  }
}

export function FiatDisplay(props: {| shouldHideBalance: boolean, amount: BigNumber | null, currency: string |}): Node {
  if (props.shouldHideBalance) {
    return (
      <span className={styles.fiat}>
        {hiddenAmount} {props.currency}
      </span>
    );
  }

  if (props.amount == null) {
    return <div className={styles.isLoading} />;
  }

  return (
    <div className={styles.fiat}>
      {formatValue(props.amount)} {props.currency}
    </div>
  );
}
