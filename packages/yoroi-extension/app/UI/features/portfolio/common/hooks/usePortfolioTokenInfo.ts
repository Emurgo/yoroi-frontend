import { createUnknownTokenInfo, isPrimaryToken } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';
import { useQuery, UseQueryOptions } from 'react-query';
import { tokenManagers } from '../helpers/build-token-manager';
import React from 'react';

export const usePortfolioTokenInfos = (
  {
    wallet,
    tokenIds,
    sourceId = 'useTokenInfos',
  }: { wallet: any; tokenIds: ReadonlyArray<Portfolio.Token.Id>; sourceId?: string },
  options: UseQueryOptions<Map<`${string}.${string}`, Portfolio.Token.Info>, Error> = {}
) => {
  const stableTokenIds = React.useMemo(() => tokenIds, [JSON.stringify(tokenIds)]);

  const tokenManager = tokenManagers[wallet.networkId as Chain.SupportedNetworks];
  const query = useQuery({
    queryKey: [wallet.networkId, sourceId, stableTokenIds],
    enabled: tokenIds.length > 0,
    ...options,
    queryFn: async () => {
      const secondaryTokenIds = stableTokenIds.filter(id => !isPrimaryToken(id));
      console.log('secondaryTokenIds', secondaryTokenIds);
      const response = await tokenManager.sync({ secondaryTokenIds, sourceId });
      console.log('usePortfolioTokenInfos response', response);

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
