import { getSwapConfigApiMaker } from '@yoroi/swap';
import { useQuery } from 'react-query';

export const useSwapConfig = () => {
  const getSwapConfig = getSwapConfigApiMaker();
  const query = useQuery({
    useErrorBoundary: false,
    queryKey: ['useSwapConfig111'],
    queryFn: () => getSwapConfig(),
  });

  const swapConfig = query.data;
  const partners = swapConfig?.partners;
  const excludedTokens = swapConfig?.excludedTokens ?? [];

  return {
    ...query,
    swapConfig,
    // tokenOutId,
    excludedTokens,
    partners,
  };
};
