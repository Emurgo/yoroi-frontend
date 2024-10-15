// @flow
import { observer } from 'mobx-react';
import { BigNumber } from 'bignumber.js';
import { Component } from 'react';
import { getTokenName } from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import { hiddenAmount } from '../../utils/strings';
import styles from './AmountDisplay.scss';
import type { MultiToken, TokenLookupKey } from '../../api/common/lib/MultiToken';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import type { Node } from 'react';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { formatValue, calculateAndFormatValue } from '../../utils/unit-of-account';
import { Typography } from '@mui/material';

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
      fiatDisplay = <span>{hiddenAmount}</span>;
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
          <Typography variant="body2" color="ds.text_gray_medium" fontWeight="500" id={id + '-availableBalance-text'} mt="10px">
            {balanceDisplay}&nbsp;{truncateToken(getTokenName(tokenInfo))}
          </Typography>
        )}
        {showFiat === true && (
          <Typography mb="5px" color="ds.text_gray_low" fontSize="12px" lineHeight="16px" id={id + '-availableFiatBalance-text'}>
            {fiatDisplay || '-'}&nbsp;{currency || 'USD'}
          </Typography>
        )}
      </>
    );
  }
}

export function FiatDisplay(props: {| shouldHideBalance: boolean, amount: BigNumber | null, currency: string |}): Node {
  if (props.shouldHideBalance) {
    return (
      <Typography className={styles.fiat} variant="body2" color="ds.text_gray_medium" fontWeight="500">
        {hiddenAmount} {props.currency}
      </Typography>
    );
  }

  if (props.amount == null) {
    return <div className={styles.isLoading} />;
  }

  return (
    <Typography variant="body2" className={styles.fiat} color="ds.text_gray_medium" fontWeight="500">
      {formatValue(props.amount)} {props.currency}
    </Typography>
  );
}
