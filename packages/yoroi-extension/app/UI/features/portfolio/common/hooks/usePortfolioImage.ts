import { useQuery, useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { Chain } from '@yoroi/types';

const supportedSizes = [64, 128, 256, 512, 720] as const;
const getClosestSize = (size: number | string) => {
  const n = Number(size);
  return supportedSizes.find(s => n <= s) ?? supportedSizes.at(-1);
};

type UsePortfolioImageProps = {
  policy: string;
  name: string;
  width: number | string;
  height: number | string;
  mediaType?: string;
  contentFit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
  kind?: 'logo' | 'metadata';
};

export const usePortfolioImage = ({
  policy,
  name,
  width,
  height,
  mediaType = 'image/webp',
  contentFit = 'cover',
  kind = 'metadata',
}: UsePortfolioImageProps) => {
  const queryClient = useQueryClient();
  const network = Chain.Network.Mainnet;

  const w = getClosestSize(width);
  const h = getClosestSize(height);
  const mimeType = mediaType.toLowerCase() === 'image/gif' ? 'image/gif' : 'image/webp';

  const cacheKey = [`token-img`, `${policy}.${name}`, `${w}x${h}`, kind, contentFit];

  const { data: uri, isError, isLoading, refetch } = useQuery({
    queryKey: cacheKey,
    staleTime: Infinity,
    cacheTime: Infinity,
    queryFn: async () => {
      return `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=${w}&height=${h}&kind=${kind}&fit=${contentFit}`;
    },
  });

  const onLoad = useCallback(() => {}, []);
  const onError = useCallback(() => {
    // Optional: add logic to retry or invalidate here
  }, [refetch]);

  return {
    uri,
    headers: { Accept: mimeType },
    isError,
    isLoading,
    crossOrigin: 'anonymous' as const,
    onLoad,
    onError,
  };
};
