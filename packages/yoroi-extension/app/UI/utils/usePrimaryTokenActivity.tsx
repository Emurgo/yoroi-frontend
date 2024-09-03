import { fetchData, isRight } from '@yoroi/common';
import { useQuery, UseQueryOptions } from 'react-query';

import { CurrencySymbol, PriceMultipleResponse } from '../types/other';
import { time } from './constants';
import { queryInfo } from './query-client';

// NOTE: this API should be moved inside portfolio token activity (support PT in the request)
// NOTE: price API is unique for all networks
const apiBaseUrl = 'https://api.yoroiwallet.com/api';
const ptTicker = 'ADA';

type PrimaryTokenActivity = {
  ts: number;
  close: number;
  open: number;
};
const defaultPrimaryTokenActivity: PrimaryTokenActivity = {
  ts: 0,
  close: 1,
  open: 1,
};

export const usePrimaryTokenActivity = ({
  to,
  options,
}: {
  to: CurrencySymbol;
  options?: UseQueryOptions<PrimaryTokenActivity, Error>;
}) => {
  const query = useQuery({
    enabled: to !== ptTicker,
    staleTime: time.oneMinute,
    cacheTime: time.fiveMinutes,
    retryDelay: time.oneSecond,
    optimisticResults: true,
    refetchInterval: time.oneMinute,
    queryKey: [queryInfo.keyToPersist, 'usePrimaryTokenActivity', to],
    ...options,
    queryFn: async () => {
      const response = await fetchPtPriceActivity([Date.now(), Date.now() - time.oneDay]);

      if (isRight(response)) {
        // NOTE: transformer
        const tickers = response.value.data.tickers;
        const ts = tickers[0]?.timestamp ?? 0;
        const close = tickers[0]?.prices[to] ?? 1;
        const open = tickers[1]?.prices[to] ?? 1;
        return {
          ts,
          close,
          open,
        };
      }

      return defaultPrimaryTokenActivity;
    },
  });

  if (query.data) return { ptActivity: query.data, isLoading: query.isLoading };

  return { ptActivity: defaultPrimaryTokenActivity, isLoading: query.isLoading };
};

export const fetchPtPriceActivity = (timestamps: Array<number>) =>
  fetchData<PriceMultipleResponse>({
    url: `${apiBaseUrl}/price/${ptTicker}/${timestamps.join()}`,
    method: 'get',
  });
