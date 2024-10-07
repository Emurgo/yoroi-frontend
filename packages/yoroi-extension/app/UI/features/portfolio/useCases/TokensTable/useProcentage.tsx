import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { formatValue } from '../../common/components/PortfolioHeader';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { bigNumberToBigInt } from './TableColumnsChip';

export const useProcessedTokenData = ({ data, ptActivity, data24h }) => {
  const { accountPair, primaryTokenInfo } = usePortfolio();

  // Helper function to calculate total fiat value for each token
  const calculateTotalFiatForToken = token => {
    const isPrimaryToken = token.id === '-';
    const secondaryToken24Activity = data24h && data24h[token.info.id];

    const tokenPrice =
      isPrimaryToken && secondaryToken24Activity === undefined
        ? ptActivity.close
        : secondaryToken24Activity && secondaryToken24Activity[1].price.close;
    const tokenPriceFiat = tokenPrice ? new BigNumber(tokenPrice) : 1;
    const tokenQuantityAsBigInt = bigNumberToBigInt(token.quantity);
    const decimals = isPrimaryToken ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

    const totalValue = atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPriceFiat)
      .times(new BigNumber(ptActivity.close))
      .toNumber();

    const primaryTokenFiatTotalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptActivity.close)));

    const totalTokenPrice = isPrimaryToken ? primaryTokenFiatTotalAmount : totalValue;
    const unitPrice = accountPair?.from.name === 'ADA' ? tokenPrice : totalTokenPrice / Number(token.shiftedAmount);

    return { totalValue: totalTokenPrice, unitPrice };
  };

  // Use useMemo to calculate fiat values, percentages, and sort by percentage
  const processedData = useMemo(() => {
    // Calculate total fiat values for all tokens
    const tokenFiatValues = data.reduce((acc, token) => {
      const totalFiat = calculateTotalFiatForToken(token);

      acc[token.info.id] = totalFiat;
      return acc;
    }, {});

    // Calculate total portfolio value
    const totalPortfolioValue = Object.values(tokenFiatValues).reduce((sum, value) => {
      return Number(sum) + Number(value?.totalValue);
    }, 0);

    // Calculate percentages for each token and then sort by percentage
    const sortedData = data
      .map(token => {
        const { totalValue, unitPrice } = tokenFiatValues[token.info.id] || 0;
        const percentage = totalPortfolioValue > 0 ? (totalValue / totalPortfolioValue) * 100 : 0;

        return {
          ...token,
          totalValue,
          percentage,
          unitPrice,
        };
      })
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage in ascending order

    return sortedData;
  }, [data, ptActivity, data24h, accountPair, primaryTokenInfo]);

  return processedData;
};
