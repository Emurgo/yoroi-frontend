import { amountBreakdown } from '@yoroi/portfolio';
import { PortfolioTokenAmountRecords } from '@yoroi/types/lib/typescript/portfolio/amount';
import { PortfolioApiTokenActivityResponse } from '@yoroi/types/lib/typescript/portfolio/api';
import { PortfolioTokenInfo } from '@yoroi/types/src/portfolio/info';
import BigNumber from 'bignumber.js';

export const aggregatePrimaryAmount = ({
  primaryTokenInfo,
  tokenAmountRecords,
  tokenActivity,
}: {
  primaryTokenInfo: PortfolioTokenInfo;
  tokenAmountRecords?: PortfolioTokenAmountRecords;
  tokenActivity?: PortfolioApiTokenActivityResponse;
}) => {
  // @ts-ignore
  if (!tokenAmountRecords) return { info: primaryTokenInfo, quantity: 0n };

  return Object.values(tokenAmountRecords).reduce(
    (totalAmount, tokenAmount) => {
      const tokenPrimaryPrice = tokenActivity?.[tokenAmount.info.id]?.price.close ?? new BigNumber(0);

      const quantity =
        tokenAmount.info.id === primaryTokenInfo.id
          ? tokenAmount.quantity
          : BigInt(amountBreakdown(tokenAmount).bn.times(tokenPrimaryPrice).shiftedBy(primaryTokenInfo.decimals).toFixed(0));
      totalAmount.quantity += quantity;
      return totalAmount;
    },
    {
      info: primaryTokenInfo,
      // @ts-ignore
      quantity: 0n,
    }
  );
};
