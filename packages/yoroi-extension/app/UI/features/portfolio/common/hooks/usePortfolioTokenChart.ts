import { isRight } from '@yoroi/common';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
// import { useLanguage } from '../../../kernel/i18n';
import { supportedCurrencies, time } from '../../../../utils/constants';
import { fetchPtPriceActivity } from '../../../../utils/usePrimaryTokenActivity';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { TOKEN_CHART_INTERVAL } from '../helpers/constants';
import { getTimestampsTokenInterval } from '../helpers/getTimestampsTokenInterval';
import { priceChange } from '../helpers/priceChange';

export type TokenChartInterval = (typeof TOKEN_CHART_INTERVAL)[keyof typeof TOKEN_CHART_INTERVAL];

type TokenChartData = {
  label: string;
  value: number;
  changePercent: number;
  changeValue: number;
};

type TokenChartQueryKey = ['useGetPortfolioTokenChart', string, TokenChartInterval, string | undefined];

export const useGetPortfolioTokenChart = (
  timeInterval = TOKEN_CHART_INTERVAL.DAY as TokenChartInterval,
  tokenInfo: any,
  options: Omit<UseQueryOptions<TokenChartData[], Error, TokenChartData[], TokenChartQueryKey>, 'queryKey' | 'queryFn'> = {}
) => {
  // const { currency } = useCurrencyPairing();
  const { unitOfAccount, primaryTokenInfo } = usePortfolio();

  const currency = unitOfAccount;

  const ptQuery = useQuery<TokenChartData[], Error, TokenChartData[], TokenChartQueryKey>({
    staleTime: time.halfHour,
    gcTime: time.oneHour, // v5: cacheTime -> gcTime
    retryDelay: time.oneSecond,
    refetchInterval: time.oneMinute,
    throwOnError: true,
    refetchOnMount: false,
    enabled: !!tokenInfo && tokenInfo.info?.id.length === 0,
    ...options,
    queryKey: ['useGetPortfolioTokenChart', tokenInfo.info?.id ?? '', timeInterval, currency ?? undefined],
    queryFn: async () => {
      const response = await fetchPtPriceActivity(getTimestampsTokenInterval(timeInterval));
      if (isRight(response)) {
        if (response.value.data.error) throw new Error(response.value.data.error);

        const tickers = response.value.data.tickers;
        const validCurrency =
          currency === primaryTokenInfo.name ? supportedCurrencies.USD : (currency ?? supportedCurrencies.USD);

        const initialPrice = tickers[0]?.prices[validCurrency];
        const records = tickers
          .map((ticker: any) => {
            const value = ticker.prices[validCurrency];
            if (value === undefined) return undefined;

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

  return ptQuery;
  // return tokenInfo && isPrimaryToken(tokenInfo.info) ? ptQuery : otherQuery;
};
