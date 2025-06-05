import { createUnknownTokenInfo, isPrimaryToken } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';
import { useQuery, UseQueryOptions } from 'react-query';
import React from 'react';

export const usePortfolioTokenInfos = (
  {
    tokenManager,
    wallet,
    tokenIds,
    sourceId = 'useTokenInfos',
  }: { tokenManager: any; wallet: any; tokenIds: ReadonlyArray<Portfolio.Token.Id>; sourceId?: string },
  options: UseQueryOptions<Map<`${string}.${string}`, Portfolio.Token.Info>, Error> = {}
) => {
  const stableTokenIds = React.useMemo(() => tokenIds, [JSON.stringify(tokenIds)]);

  const query = useQuery({
    queryKey: [wallet.networkId, sourceId, stableTokenIds],
    enabled: tokenIds.length > 0,
    ...options,
    queryFn: async () => {
      const secondaryTokenIds = stableTokenIds.filter(id => !isPrimaryToken(id));
      const response = await tokenManager.sync({ secondaryTokenIds, sourceId });

      const result = new Map<`${string}.${string}`, Portfolio.Token.Info>([
        [wallet.portfolioPrimaryTokenInfo.id, wallet.portfolioPrimaryTokenInfo],
      ]);

      for (const [id, tokenInfo] of response) {
        result.set(id, tokenInfo?.record ?? createUnknownTokenInfo({ id }));
      }

      return result;
    },
  });

  return {
    ...query,

    tokenInfos: query.data,
  };
};
