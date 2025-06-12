import { useQuery } from 'react-query';
import { isRight } from '@yoroi/common';
import { isPrimaryToken, createUnknownTokenInfo } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';

type UseSyncedTokenInfosProps = {
  swapManager: any;
  tokenManager: any;
  primaryTokenInfo: Portfolio.Token.Info;
  networkId: Chain.Network;
  excludedTokens: string[];
};

export const useSyncedTokenInfos = ({
  swapManager,
  tokenManager,
  primaryTokenInfo,
  networkId,
  excludedTokens,
}: UseSyncedTokenInfosProps) => {
  const queryResult = useQuery({
    queryKey: ['syncedTokenInfos', networkId, primaryTokenInfo.id, ...excludedTokens],

    queryFn: async () => {
      const res = await swapManager.api.tokens();
      if (!isRight(res)) return { tokenIds: [], tokenInfosArray: [] };

      // Normalize and filter token IDs
      const tokenIds = res.value.data
        .map(({ id }) => (typeof id === 'string' ? id.trim().replace(/:$/, '') : id?.id))
        .filter((id): id is string => !!id && id !== '.' && !excludedTokens.includes(id));

      const secondaryTokenIds = tokenIds.filter(id => !isPrimaryToken(id));

      try {
        const response = await tokenManager.sync({
          secondaryTokenIds,
          sourceId: 'SwapProvider',
        });

        const tokenInfosArray: Array<[string, Portfolio.Token.Info]> = [];

        // Only include primary token if its ID is valid and not excluded
        const isValidPrimaryId =
          !!primaryTokenInfo.id && primaryTokenInfo.id !== '.' && !excludedTokens.includes(primaryTokenInfo.id);

        if (isValidPrimaryId) {
          tokenInfosArray.push([primaryTokenInfo.id, primaryTokenInfo]);
        }

        for (const [id, info] of response) {
          if (id && id !== '.' && !excludedTokens.includes(id)) {
            tokenInfosArray.push([id, info?.record ?? createUnknownTokenInfo({ id })]);
          }
        }

        return { tokenIds, tokenInfosArray };
      } catch (err: any) {
        if (err?.response?.status === 404) {
          console.warn('🛑 tokenManager.sync 404 - skip fetch');

          const tokenInfosArray: Array<[string, Portfolio.Token.Info]> = [];

          if (!!primaryTokenInfo.id && primaryTokenInfo.id !== '.' && !excludedTokens.includes(primaryTokenInfo.id)) {
            tokenInfosArray.push([primaryTokenInfo.id, primaryTokenInfo]);
          }

          return { tokenIds: [], tokenInfosArray };
        }

        throw err;
      }
    },

    select: data => {
      // Defensive filtering again
      const tokenInfosArray = data.tokenInfosArray.filter(([id]) => !!id && id !== '.' && !excludedTokens.includes(id));

      const tokenInfoMap = new Map(tokenInfosArray);
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

  return {
    ...queryResult,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    data: queryResult.data,
    error: queryResult.error,
  };
};
