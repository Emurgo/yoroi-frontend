import { useQuery } from 'react-query';
import { YoroiRemoteConfig } from '../../types/yoroi';
import { YOROI_REMOTE_CONFIG_URL } from '../constants';

export const useYoroiRemoteConfig = () => {
  return useQuery<YoroiRemoteConfig>({
    queryKey: ['yoroiRemoteConfig'],
    queryFn: async () => {
      const res = await fetch(YOROI_REMOTE_CONFIG_URL);
      if (!res.ok) {
        throw new Error('Failed to fetch Yoroi remote config');
      }
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};
