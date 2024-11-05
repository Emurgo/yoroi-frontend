import type { AssetAmount } from '../../../components/swap/types';
import { useSwapTokensOnlyVerified } from '@yoroi/swap';
import { useMemo } from 'react';
import { comparatorByGetter } from '../../../coreUtils';
import { useQueryClient } from 'react-query';

export function useSellVerifiedSwapTokens(
  assets: Array<AssetAmount>
): {| walletVerifiedAssets: Array<any>, isLoading: boolean, errored: boolean |} {
  const queryClient = useQueryClient();

  // <TODO:ERROR_HANDLING> maybe check `error` field from query and make it available for UI to do something
  const { onlyVerifiedTokens, isLoading, isError } = useSwapTokensOnlyVerified({
    useErrorBoundary: false,
  });

  if (isError) {
    queryClient.invalidateQueries({ queryKey: ['useSwapTokensOnlyVerified'] });
  }

  const swapFromVerifiedAssets = useMemo(() => {
    return assets
      .map(a => {
        const vft = onlyVerifiedTokens?.find(ovt => ovt.fingerprint === a.fingerprint);
        return a.id === '' || vft ? { ...a, ...(vft ?? {}) } : undefined;
      })
      .filter(Boolean)
      .sort(comparatorByGetter(a => a.name?.toLowerCase()));
  }, [onlyVerifiedTokens, assets]);

  return { walletVerifiedAssets: swapFromVerifiedAssets, isLoading, errored: isError };
}

export function useBuyVerifiedSwapTokens(
  assets: Array<AssetAmount>,
  sellTokenInfo: { id: string, ... }
): {| walletVerifiedAssets: Array<any>, isLoading: boolean, errored: boolean |} {
  const queryClient = useQueryClient();

  // <TODO:ERROR_HANDLING> maybe check `error` field from query and make it available for UI to do something
  const { onlyVerifiedTokens, isLoading, isError } = useSwapTokensOnlyVerified({
    useErrorBoundary: false,
  });

  if (isError) {
    queryClient.invalidateQueries({ queryKey: ['useSwapTokensOnlyVerified'] });
  }

  const swapToVerifiedAssets = useMemo(() => {
    const isSellingPt = sellTokenInfo.id === '';
    const pt = assets.find(a => a.id === '');
    const nonPtAssets = (onlyVerifiedTokens ?? [])
      .map(ovt => {
        if (ovt.id === '') return null;
        const vft = assets.find(a => a.fingerprint === ovt.fingerprint);
        return { ...ovt, ...(vft ?? {}) };
      })
      .filter(Boolean)
      .sort(comparatorByGetter(a => a.name?.toLowerCase()));
    return [...(isSellingPt ? [] : [pt]), ...nonPtAssets];
  }, [onlyVerifiedTokens, assets, sellTokenInfo]);

  return { walletVerifiedAssets: swapToVerifiedAssets, isLoading, errored: isError };
}
