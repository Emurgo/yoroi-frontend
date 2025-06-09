import { useQuery } from 'react-query';
import { isRight } from '@yoroi/common';
import { isPrimaryToken, createUnknownTokenInfo } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';

type UseSyncedTokenInfosProps = {
  swapManager: any;
  tokenManager: any;
  primaryTokenInfo: Portfolio.Token.Info;
  networkId: Chain.NetworkId;
  excludedTokens: string[];
};

export const useSyncedTokenInfos = ({
  swapManager,
  tokenManager,
  primaryTokenInfo,
  networkId,
  excludedTokens,
}: UseSyncedTokenInfosProps) => {
  return useQuery({
    queryKey: ['syncedTokenInfos', networkId, primaryTokenInfo.id, ...excludedTokens],

    queryFn: async () => {
      const res = await swapManager.api.tokens();
      if (!isRight(res)) return { tokenIds: [], tokenInfosArray: [] };

      const tokenIds = res.value.data
        .map(({ id }) => (typeof id === 'string' ? id.trim().replace(/:$/, '') : id?.id))
        .filter((id): id is string => !!id && !excludedTokens.includes(id));

      const secondaryTokenIds = tokenIds.filter(id => !isPrimaryToken(id));

      try {
        const response = await tokenManager.sync({
          secondaryTokenIds,
          sourceId: 'SwapProvider',
        });

        const tokenInfosArray: Array<[string, Portfolio.Token.Info]> = [[primaryTokenInfo.id, primaryTokenInfo]];

        for (const [id, info] of response) {
          tokenInfosArray.push([id, info?.record ?? createUnknownTokenInfo({ id })]);
        }

        return { tokenIds, tokenInfosArray };
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.warn('🛑 tokenManager.sync 404 - skip fetch');
          return { tokenIds: [], tokenInfosArray: [[primaryTokenInfo.id, primaryTokenInfo]] };
        }
        throw err;
      }
    },

    select: data => {
      const tokenInfoMap = new Map(data.tokenInfosArray);
      const tokenInfoList = Array.from(tokenInfoMap.values());

      return {
        tokenIds: data.tokenIds,
        tokenInfos: tokenInfoMap,
        tokenInfoList,
      };
    },

    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity,
    cacheTime: 5 * 60 * 1000,
  });
};
