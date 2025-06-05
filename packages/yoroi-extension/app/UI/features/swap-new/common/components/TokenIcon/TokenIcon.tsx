import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@emotion/react';
import { useQuery } from 'react-query';

import defaultTokenImage from './token-default.inline.svg';
import defaultTokenDarkImage from './asset-default-dark.inline.svg';
import adaTokenImage from './ada.inline.svg';

import { useSwapRevamp } from '../../../module/SwapContextProvider';

const logoCache = new Map<string, string>();

export const TokenIcon = ({ tokenId, large = false, image }: { tokenId: string; large?: boolean; image?: string }) => {
  const { getTokenInfo } = useSwapRevamp();
  const { name }: any = useTheme();

  const { data: remoteTokenLogo } = useQuery({
    queryKey: ['token-logo', tokenId],
    queryFn: async () => {
      if (tokenId === '.') return adaTokenImage;

      if (logoCache.has(tokenId)) {
        return logoCache.get(tokenId)!;
      }

      const remoteTokenInfo = await getTokenInfo(tokenId);
      if (remoteTokenInfo?.logo) {
        const logoData = `data:image/png;base64,${remoteTokenInfo.logo}`;
        logoCache.set(tokenId, logoData);
        return logoData;
      }

      throw new Error('No logo available');
    },
    enabled: !image, // skip fetching if image is provided
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 1,
  });

  const defaultImage = name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;
  const imgSrc = image ?? remoteTokenLogo ?? defaultImage;

  return (
    <Box
      width={large ? '48px' : '24px'}
      height={large ? '48px' : '24px'}
      sx={{
        overflowY: 'hidden',
        '& > svg': { width: '100%', height: '100%' },
        borderRadius: '4px',
      }}
    >
      <img
        width="100%"
        src={imgSrc}
        alt=""
        onError={(e: any) => {
          e.target.src = defaultImage;
        }}
      />
    </Box>
  );
};
