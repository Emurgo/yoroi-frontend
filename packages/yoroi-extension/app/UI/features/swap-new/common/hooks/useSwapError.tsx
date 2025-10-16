import React from 'react';
import { useStrings } from './useStrings';

export const useSwapErrorLabel = () => {
  const S = useStrings();
  const dict = React.useMemo<Record<string, string>>(
    () => ({
      token_in_must_be_different_from_token_out: S.buyAndSellToken,
    }),
    [S]
  );

  return React.useCallback(
    (code?: string | null): string | null => {
      if (!code) return null;
      return dict[code] ?? null;
    },
    [dict]
  );
};
