import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { formatValue } from '../../common/components/PortfolioHeader';
import { priceChange } from '../../common/helpers/priceChange';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { bigNumberToBigInt } from './TableColumnsChip';

export const useProcessedTokenData = ({ data, ptActivity, data24h, data7d, data30d }) => {
  const { primaryTokenInfo } = usePortfolio();

  // Helper to calculate fiat value and unit price for a token
  const calculateTotalFiatForToken = token => {
    const isPrimaryToken = token.id === '-';
    const secondaryToken24Activity = data24h?.[token.info.id];

    const tokenPrice =
      isPrimaryToken && !secondaryToken24Activity ? ptActivity?.close : secondaryToken24Activity?.[1].price?.close || 1;

    const tokenQuantity = atomicBreakdown(
      bigNumberToBigInt(token.quantity),
      isPrimaryToken ? primaryTokenInfo.decimals : token.info.numberOfDecimals
    );
    const totalValue = tokenQuantity.bn
      .times(new BigNumber(tokenPrice))
      .times(new BigNumber(ptActivity?.close || 1))
      .toNumber();

    const unitPrice = parseFloat((tokenPrice * ptActivity?.close || 1).toFixed(4));
    const primaryTokenFiatTotalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptActivity?.close)));

    return { totalValue: isPrimaryToken ? primaryTokenFiatTotalAmount : totalValue, unitPrice };
  };

  const getTokenActivityChange = (tokenId, activityData, isPrimaryToken) => {
    const activity = activityData?.[tokenId];
    return isPrimaryToken
      ? { open: ptActivity?.open, close: ptActivity?.close }
      : { open: activity?.[1].price?.open, close: activity?.[1].price?.close };
  };

  // Memoized data processing
  const processedData = useMemo(() => {
    const tokenFiatValues = data.reduce((acc, token) => {
      acc[token.info.id] = calculateTotalFiatForToken(token);
      return acc;
    }, {});

    const totalPortfolioValue = Object.values(tokenFiatValues).reduce(
      (sum: number, { totalValue }: any) => sum + Number(totalValue),
      0
    );

    return data
      .map(token => {
        const { totalValue, unitPrice } = tokenFiatValues[token.info.id] || {};
        const percentage = totalPortfolioValue ? (totalValue / Number(totalPortfolioValue)) * 100 : 0;
        const isPrimaryToken = token.id === '-';

        const { open: open24, close: close24 } = getTokenActivityChange(token.info.id, data24h, isPrimaryToken);
        const { open: open7d, close: close7d } = getTokenActivityChange(token.info.id, data7d, isPrimaryToken);
        const { open: open30d, close: close30d } = getTokenActivityChange(token.info.id, data30d, isPrimaryToken);

        const changePercent24 = priceChange(open24, close24).changePercent;
        const changePercent7d = priceChange(open7d, close7d).changePercent;
        const changePercent30d = priceChange(open30d, close30d).changePercent;

        return {
          ...token,
          percentage,
          totalAmount: totalValue,
          price: unitPrice,
          '24h': changePercent24,
          '1W': Number(changePercent7d),
          '1M': changePercent30d,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [data, ptActivity, data24h, data7d, data30d, primaryTokenInfo]);

  return processedData;
};
