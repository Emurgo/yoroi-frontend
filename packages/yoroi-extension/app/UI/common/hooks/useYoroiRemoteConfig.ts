import { useQuery } from '@tanstack/react-query';
import { YoroiRemoteConfig } from '../../types/yoroi';
import { YOROI_DEV_REMOTE_CONFIG_URL, YOROI_PROD_REMOTE_CONFIG_URL } from '../constants';
import { environment } from '../../../environment';

export const useYoroiRemoteConfig = () => {
  const isDev = environment.isDev();

  return useQuery<YoroiRemoteConfig>({
    queryKey: ['yoroiRemoteConfig', isDev],
    queryFn: async () => {
      const res = await fetch(isDev ? YOROI_DEV_REMOTE_CONFIG_URL : YOROI_PROD_REMOTE_CONFIG_URL);
      if (!res.ok) {
        throw new Error('Failed to fetch Yoroi remote config');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // v5: cacheTime -> gcTime (30 minutes)
  });
};
