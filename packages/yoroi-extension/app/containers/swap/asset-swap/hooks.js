import { useSwapTokensOnlyVerified } from '@yoroi/swap';
import { useMemo } from 'react';

export function useVerifiedSwapTokens(assets) {
  try {
    const { onlyVerifiedTokens } = useSwapTokensOnlyVerified();

    const walletVerifiedAssets = useMemo(() => {
      return assets
        .map(a => {
          const vft = onlyVerifiedTokens.find(ovt => ovt.fingerprint === a.fingerprint);
          return a.id === '' || vft ? { ...a, ...vft } : undefined;
        })
        .filter(Boolean)
        .sort(comparatorByGetter(a => a.name?.toLowerCase()));
    }, [onlyVerifiedTokens, assets]);

    return { walletVerifiedAssets };
  } catch (error) {
    return {
      walletVerifiedAssets: [],
    };
  }
}
