//@flow
import { useMemo } from 'react';
import adaLogo from './mockAssets/ada.inline.svg';
import {
  genLookupOrFail,
  getTokenIdentifierIfExists,
  getTokenName,
} from '../../stores/stateless/tokenHelpers';
import { splitAmount, truncateToken } from '../../utils/formatters';
import useSwapPage from './context/swap-page/useSwapPage';
import { useSwap, useSwapPoolsByPair } from '@yoroi/swap';

export function useAssets(): Array<any> {
  const { spendableBalance, tokenInfo } = useSwapPage();
  const getTokenInfo = genLookupOrFail(tokenInfo);

  const assetsList = useMemo(() => {
    if (spendableBalance == null) return [];
    return [spendableBalance.getDefaultEntry()]
      .concat(...spendableBalance.nonDefaultEntries())
      .map(entry => ({
        entry,
        info: getTokenInfo(entry),
      }))
      .filter(t => !Boolean(t.info.IsNFT))
      .map(token => {
        const numberOfDecimals = token.info?.Metadata.numberOfDecimals ?? 0;
        const id = token.info.Identifier;
        const shiftedAmount = token.entry.amount.shiftedBy(-numberOfDecimals);
        const [beforeDecimal, afterDecimal] = splitAmount(shiftedAmount, numberOfDecimals);
        return {
          id,
          group: token.info?.Metadata.policyId,
          fingerprint: getTokenIdentifierIfExists(token.info) ?? '',
          name: id == null
            ? token.info?.Metadata.ticker
            : truncateToken(getTokenName(token.info)),
          decimals: token.info?.Metadata.numberOfDecimals,
          ticker: token.info?.Metadata.ticker ?? truncateToken(getTokenName(token.info)),
          kind: token.info?.IsNFT ? 'nft' : 'ft',
          amount: [beforeDecimal, afterDecimal].join(''),
          amountForSorting: shiftedAmount,
          description: '',
          metadatas: token.info?.Metadata,
          image: id ? '' : adaLogo,
        };
      });
  }, [spendableBalance, getTokenInfo]);

  return assetsList;
}

export async function useAsyncPools(tokenA: string, tokenB: string): Promise<void> {
  const { poolPairsChanged } = useSwap();
  useSwapPoolsByPair(
    { tokenA, tokenB },
    {
      onSuccess: pools => {
        poolPairsChanged(pools);
      },
    }
  );
}
