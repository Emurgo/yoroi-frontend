import { useSwapTokensOnlyVerified } from '@yoroi/swap';
import { useMemo } from 'react';
import { comparatorByGetter } from '../../../coreUtils';

const getSwapFromVerifiedAssets = (assets, onlyVerifiedTokens) => {
  const walletVerifiedAssets = useMemo(() => {
    return assets
      .map(a => {
        const vft = onlyVerifiedTokens.find(ovt => ovt.fingerprint === a.fingerprint);
        return a.id === '' || vft ? { ...a, ...vft } : undefined;
      })
      .filter(Boolean)
      .sort(comparatorByGetter(a => a.name?.toLowerCase()));
  }, [onlyVerifiedTokens, assets]);
  return walletVerifiedAssets;
};

const getSwapToVerifiedAssets = (assets, onlyVerifiedTokens, sellTokenInfo) => {
  console.error('getSwapToVerifiedAssets is called');
  const walletVerifiedAssets = useMemo(() => {
    const isSellingPt = sellTokenInfo.id === '';
    const pt = assets.find(a => a.id === '');
    const nonPtAssets = onlyVerifiedTokens
      .map(ovt => {
        if (ovt.id === '') return null;
        const vft = assets.find(a => a.fingerprint === ovt.fingerprint);
        return { ...ovt, ...(vft ?? {}) };
      })
      .filter(Boolean)
      .sort(comparatorByGetter(a => a.name?.toLowerCase()));
    return [...(isSellingPt ? [] : [pt]), ...nonPtAssets];
  }, [onlyVerifiedTokens, assets, sellTokenInfo]);
  return walletVerifiedAssets;
};

export function useVerifiedSwapTokens(assets, sellTokenInfo = null) {
  try {
    const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();
    const walletVerifiedAssets =
      sellTokenInfo !== null
        ? getSwapToVerifiedAssets(assets, onlyVerifiedTokens, sellTokenInfo)
        : getSwapFromVerifiedAssets(assets, onlyVerifiedTokens);

    return { walletVerifiedAssets };
  } catch (error) {
    return {
      walletVerifiedAssets: [],
    };
  }
}
