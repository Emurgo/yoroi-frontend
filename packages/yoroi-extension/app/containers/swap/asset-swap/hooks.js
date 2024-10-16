import type { AssetAmount } from '../../../components/swap/types';
import { useSwapTokensOnlyVerified } from '@yoroi/swap';
import { useMemo } from 'react';
import { comparatorByGetter } from '../../../coreUtils';

export function useSellVerifiedSwapTokens(
  assets: Array<AssetAmount>
): {| walletVerifiedAssets: Array<any>, isLoading: boolean, error: boolean |} {
  // <TODO:ERROR_HANDLING> maybe check `error` field from query and make it available for UI to do something
  const { onlyVerifiedTokens, isLoading } = useSwapTokensOnlyVerified({
    useErrorBoundary: false,
    retry: true,
    retryDelay: 1000
  });

  const swapFromVerifiedAssets = useMemo(() => {
    return assets
      .map(a => {
        const vft = onlyVerifiedTokens?.find(ovt => ovt.fingerprint === a.fingerprint);
        return a.id === '' || vft ? { ...a, ...(vft ?? {}) } : undefined;
      })
      .filter(Boolean)
      .sort(comparatorByGetter(a => a.name?.toLowerCase()));
  }, [onlyVerifiedTokens, assets]);

  return { walletVerifiedAssets: swapFromVerifiedAssets, isLoading, error: false };
}

export function useBuyVerifiedSwapTokens(
  assets: Array<AssetAmount>,
  sellTokenInfo: { id: string, ... }
): {| walletVerifiedAssets: Array<any>, isLoading: boolean, error: boolean |} {
  // <TODO:ERROR_HANDLING> maybe check `error` field from query and make it available for UI to do something
  const { onlyVerifiedTokens, isLoading } = useSwapTokensOnlyVerified({
    useErrorBoundary: false,
    retry: true,
    retryDelay: 1000
  });

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

  return { walletVerifiedAssets: swapToVerifiedAssets, isLoading, error: false };
}
