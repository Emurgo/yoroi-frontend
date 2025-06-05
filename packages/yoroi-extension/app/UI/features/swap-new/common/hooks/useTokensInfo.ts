import { useQuery } from 'react-query';
import { createUnknownTokenInfo, isPrimaryToken } from '@yoroi/portfolio';
import { Portfolio, Chain } from '@yoroi/types';
import { isRight } from '@yoroi/common';

type UseMergedTokenDataProps = {
  swapManager: any;
  tokenManager: any;
  wallet: {
    networkId: Chain.NetworkId;
    portfolioPrimaryTokenInfo: Portfolio.Token.Info;
  };
  excludedTokens: string[];
};

export const useTokenInfo = ({
  swapManager,
  tokenManager,
  wallet,
  excludedTokens,
}: UseMergedTokenDataProps) => {
  return useQuery({
    queryKey: ['mergedTokenData', swapManager.settings.routingPreference],
    queryFn: async () => {
      // Step 1: Fetch token IDs
      const res = await swapManager.api.tokens();

      if (!isRight(res)) return { tokenIds: [], tokenInfosArray: [] };

      const tokenIds = res.value.data
        .map(({ id }) => id)
        .filter(id => !excludedTokens.includes(id));

      // Step 2: Fetch token infos
      const secondaryTokenIds = tokenIds.filter(id => !isPrimaryToken(id));
      const response = await tokenManager.sync({
        secondaryTokenIds,
        sourceId: 'SwapProvider',
      });

      const tokenInfosArray: Array<[string, Portfolio.Token.Info]> = [
        [wallet.portfolioPrimaryTokenInfo.id, wallet.portfolioPrimaryTokenInfo],
      ];

      for (const [id, tokenInfo] of response) {
        tokenInfosArray.push([id, tokenInfo?.record ?? createUnknownTokenInfo({ id })]);
      }

      return {
        tokenIds,
        tokenInfosArray,
      };
    },

    // Rebuild both Map and Array from tokenInfosArray
    select: (data) => {
      const tokenInfoMap = new Map(data.tokenInfosArray);
      const tokenInfoList = Array.from(tokenInfoMap.values());

      return {
        tokenIds: data.tokenIds,
        tokenInfos: tokenInfoMap,
        tokenInfoList, // convenient for .map()
      };
    },
  });
};
