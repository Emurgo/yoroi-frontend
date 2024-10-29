import { isRight } from '@yoroi/common';
import { useQuery, UseQueryOptions } from 'react-query';

// import { useLanguage } from '../../../kernel/i18n';
import { supportedCurrencies, time } from '../../../../utils/constants';
import { fetchPtPriceActivity } from '../../../../utils/usePrimaryTokenActivity';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { TOKEN_CHART_INTERVAL } from '../helpers/constants';
import { getTimestampsTokenInterval } from '../helpers/getTimestampsTokenInterval';
import { priceChange } from '../helpers/priceChange';

export type TokenChartInterval = typeof TOKEN_CHART_INTERVAL[keyof typeof TOKEN_CHART_INTERVAL];

type TokenChartData = {
  label: string;
  value: number;
  changePercent: number;
  changeValue: number;
};

// function generateMockChartData(timeInterval: TokenChartInterval = TOKEN_CHART_INTERVAL.DAY): TokenChartData[] {
//   const dataPoints = 50;
//   const startValue = 100;
//   const volatility = 50;

//   const startDate = new Date('2024-02-02T15:09:00');

//   function getTimeIncrement(interval: TokenChartInterval): number {
//     switch (interval) {
//       case TOKEN_CHART_INTERVAL.DAY:
//         return 60 * 60 * 1000; // 1 hour
//       case TOKEN_CHART_INTERVAL.WEEK:
//         return 24 * 60 * 60 * 1000; // 1 day
//       case TOKEN_CHART_INTERVAL.MONTH:
//         return 30 * 24 * 60 * 60 * 1000; // 1 month (approximated as 30 days)
//       case TOKEN_CHART_INTERVAL.SIX_MONTHS:
//         return 6 * 30 * 24 * 60 * 60 * 1000; // 6 months
//       case TOKEN_CHART_INTERVAL.YEAR:
//         return 12 * 30 * 24 * 60 * 60 * 1000; // 1 year (approximated as 360 days)
//       default:
//         return 60 * 1000; // Default to 1 minute
//     }
//   }

//   const increment = getTimeIncrement(timeInterval);
//   const chartData: TokenChartData[] = [];

//   let previousValue = startValue;

//   for (let i = 0; i < dataPoints; i++) {
//     const date = new Date(startDate.getTime() + i * increment);
//     const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
//       .toString()
//       .padStart(2, '0')}/${date.getFullYear().toString().substr(-2)} ${date.getHours()}:${date
//       .getMinutes()
//       .toString()
//       .padStart(2, '0')}`;
//     const value = i === 0 ? startValue : previousValue + (Math.random() - 0.5) * volatility;
//     const changeValue = i === 0 ? 0 : value - previousValue;
//     const changePercent = i === 0 ? 0 : (changeValue / previousValue) * 100;

//     chartData.push({
//       label,
//       value,
//       changePercent,
//       changeValue,
//     });

//     previousValue = value; // Update previousValue for the next iteration
//   }

//   return chartData;
// }

const ptTicker = 'ADA';

export const useGetPortfolioTokenChart = (
  timeInterval = TOKEN_CHART_INTERVAL.DAY as TokenChartInterval,
  tokenInfo,
  options: UseQueryOptions<
    TokenChartData[],
    Error,
    TokenChartData[],
    ['useGetPortfolioTokenChart', string, TokenChartInterval, ReturnType<any>['currency']?]
  > = {}
) => {
  // const { currency } = useCurrencyPairing();
  const { unitOfAccount } = usePortfolio();

  const currency = unitOfAccount;

  const ptQuery = useQuery({
    staleTime: time.halfHour,
    cacheTime: time.oneHour,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.halfHour,
    useErrorBoundary: true,
    refetchOnMount: false,
    enabled: tokenInfo && tokenInfo.info?.id.length === 0,
    ...options,
    queryKey: ['useGetPortfolioTokenChart', tokenInfo.info?.id ?? '', timeInterval, currency],
    queryFn: async () => {
      // @ts-ignore

      const response = await fetchPtPriceActivity(getTimestampsTokenInterval(timeInterval));
      if (isRight(response)) {
        if (response.value.data.error) throw new Error(response.value.data.error);

        const tickers = response.value.data.tickers;
        // @ts-ignore
        const validCurrency = currency === ptTicker ? supportedCurrencies.USD : currency ?? supportedCurrencies.USD;

        const initialPrice = tickers[0]?.prices[validCurrency];
        const records = tickers
          .map(ticker => {
            const value = ticker.prices[validCurrency];
            if (value === undefined) return undefined;
            // @ts-ignore
            const { changePercent, changeValue } = priceChange(initialPrice, value);
            const label = new Date(ticker.timestamp).toLocaleString('en', {
              dateStyle: 'short',
              timeStyle: 'short',
            });
            return { label, value, changePercent, changeValue };
          })
          .filter(Boolean) as TokenChartData[];
        return records;
      }
      throw new Error('Failed to fetch token chart data');
    },
  });

  // const otherQuery = useQuery({
  //   useErrorBoundary: true,
  //   refetchOnMount: false,
  //   enabled: tokenInfo && !isPrimaryToken(tokenInfo.info),
  //   ...options,
  //   queryKey: ['useGetPortfolioTokenChart', tokenInfo?.info.id ?? '', timeInterval],
  //   queryFn: async () => {
  //     await new Promise(resolve => setTimeout(resolve, 1));
  //     return generateMockChartData(timeInterval);
  //   },
  // });

  return ptQuery;
  // return tokenInfo && isPrimaryToken(tokenInfo.info) ? ptQuery : otherQuery;
};
