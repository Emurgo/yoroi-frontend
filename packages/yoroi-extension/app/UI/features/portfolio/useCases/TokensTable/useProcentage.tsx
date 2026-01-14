import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { formatValue } from '../../common/components/PortfolioHeader';
import { TOKEN_CHART_INTERVAL } from '../../common/helpers/constants';
import { priceChange } from '../../common/helpers/priceChange';
import { useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { bigNumberToBigInt } from './TableColumnsChip';

export const useProcessedTokenData = ({ data, ptActivity, data24h, data7d, data30d }) => {
  const { primaryTokenInfo } = usePortfolio();
  const { data: ptTokenDataInterval7d } = useGetPortfolioTokenChart(
    {
      info: { id: '' },
    },
    TOKEN_CHART_INTERVAL.WEEK
  );
  const { data: ptTokenDataInterval1M } = useGetPortfolioTokenChart(
    {
      info: { id: '' },
    },
    TOKEN_CHART_INTERVAL.MONTH
  );

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
      .times(new BigNumber(tokenPrice.toString() || 1))
      .times(new BigNumber(ptActivity?.close.toString() || 1))
      .toNumber();

    const unitPrice = Number.parseFloat((tokenPrice * ptActivity?.close || 1).toFixed(4));
    const primaryTokenFiatTotalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptActivity?.close)));

    const tokenValueDisplay = secondaryToken24Activity?.[0] === 500 ? 0 : totalValue;
    return { totalValue: isPrimaryToken ? primaryTokenFiatTotalAmount : tokenValueDisplay, unitPrice };
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
        const portfolioPercentage = totalPortfolioValue ? (totalValue / Number(totalPortfolioValue)) * 100 : 0;
        const isPrimaryToken = token.id === '-';

        const { open: open24, close: close24 } = getTokenActivityChange(token.info.id, data24h, isPrimaryToken);
        const { open: open7d, close: close7d } = getTokenActivityChange(token.info.id, data7d, isPrimaryToken);
        const { open: open30d, close: close30d } = getTokenActivityChange(token.info.id, data30d, isPrimaryToken);

        const changePercent24 = priceChange(open24, close24).changePercent;
        const changePercent7d = priceChange(open7d, close7d).changePercent;
        const changePercent30d = priceChange(open30d, close30d).changePercent;

        return {
          ...token,
          portfolioPercentage,
          totalAmount: totalValue,
          price: totalValue === 0 ? 0 : unitPrice,
          '24h': changePercent24,
          '1W': isPrimaryToken ? ptTokenDataInterval7d?.[167]?.changePercent : changePercent7d,
          '1M': isPrimaryToken ? ptTokenDataInterval1M?.[179]?.changePercent : changePercent30d,
          isSpecialName: /^[^a-zA-Z]/.test(token.info.name), // Flag for names starting with numbers or weird characters
        };
      })
      .sort((a, b) => {
        // Move tokens with special names and 0 portfolioPercentage to the bottom
        if (a.isSpecialName && a.portfolioPercentage === 0) return 1;
        if (b.isSpecialName && b.portfolioPercentage === 0) return -1;
        // Default sorting by portfolioPercentage
        return Number(b.portfolioPercentage) - Number(a.portfolioPercentage);
      });
  }, [data, ptActivity, data24h, data7d, data30d, primaryTokenInfo, ptTokenDataInterval7d, ptTokenDataInterval1M]);

  return processedData;
};
