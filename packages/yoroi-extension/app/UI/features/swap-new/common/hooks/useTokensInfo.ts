import { useRef } from 'react';
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

const cleanTokenId = (id: unknown): string | null => {
  if (typeof id === 'string') return id.trim().replace(/:$/, '');
  if (typeof id === 'object' && id !== null && 'id' in id && typeof id.id === 'string') {
    return id.id.trim().replace(/:$/, '');
  }
  return null;
};

export const useSyncedTokenInfos = ({
  swapManager,
  tokenManager,
  primaryTokenInfo,
  networkId,
  excludedTokens,
}: UseSyncedTokenInfosProps) => {
  const has404Ref = useRef(false);

  return useQuery({
    queryKey: ['syncedTokenInfos', networkId, primaryTokenInfo.id, ...excludedTokens],
    staleTime: 60_000,
    keepPreviousData: true,
    enabled: !has404Ref.current,

    queryFn: async () => {
      const res = await swapManager.api.tokens();
      if (!isRight(res)) return { tokenIds: [], tokenInfosArray: [] };

      const tokenIds = res.value.data
        .map(({ id }) => cleanTokenId(id))
        .filter((id): id is string => !!id && !excludedTokens.includes(id));

      const secondaryTokenIds = tokenIds.filter(id => !isPrimaryToken(id));

      const response = await tokenManager.sync({
        secondaryTokenIds,
        sourceId: 'SwapProvider',
      });

      const tokenInfosArray: Array<[string, Portfolio.Token.Info]> = [[primaryTokenInfo.id, primaryTokenInfo]];

      for (const [id, info] of response) {
        tokenInfosArray.push([id, info?.record ?? createUnknownTokenInfo({ id })]);
      }

      return { tokenIds, tokenInfosArray };
    },

    onError: (error: any) => {
      if (error?.response?.status === 404) {
        console.warn('🛑 tokenManager.sync 404 - will not fetch again');
        has404Ref.current = true;
      }
    },

    select: data => {
      const tokenInfos = new Map(data.tokenInfosArray);
      const tokenInfoList = Array.from(tokenInfos.values());
      return {
        tokenIds: data.tokenIds,
        tokenInfos,
        tokenInfoList,
      };
    },
  });
};
