import { useYoroiRemoteConfig } from '../../../../common/hooks/useYoroiRemoteConfig';

export const useSwapConfig = () => {
  const { data } = useYoroiRemoteConfig();

  const tokenOutId = data?.swap?.initialPair?.tokenOut ?? null;
  const excludedTokens = data?.swap?.excludedTokens ?? [];
  const partners = data?.swap?.partners ?? {};

  return {
    tokenOutId,
    excludedTokens,
    partners,
  };
};
