import { useTheme } from '@emotion/react';
import React from 'react';
import defaultTokenImage from './token-default.inline.svg';
import defaultTokenDarkImage from './asset-default-dark.inline.svg';
import adaTokenImage from './ada.inline.svg';
import { Box } from '@mui/material';

export const TokenIcon = ({ large = false, image }: { large?: boolean; image: string }) => {
  const { name }: any = useTheme();

  const defaultImage = name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;
  const imgSrc = image ?? adaTokenImage;

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
