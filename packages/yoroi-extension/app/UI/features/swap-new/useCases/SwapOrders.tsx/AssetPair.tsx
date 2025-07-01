import { Box, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';

import adaTokenImage from '../../../../../assets/images/ada.inline.svg';
import defaultTokenImage from '../../../../../assets/images/revamp/token-default.inline.svg';
import defaultTokenDarkImage from '../../../../../assets/images/revamp/asset-default-dark.inline.svg';
import { urlResolveForIpfsAndCorsproxy } from '../../../../../coreUtils';
import { Portfolio } from '@yoroi/types';


type Props = {
  tokenIn?: Portfolio.Token.Info;
  tokenOut?: Portfolio.Token.Info;
  sx?: SxProps<Theme>;
  defaultTokenInfo: Portfolio.Token.Info;
}

function tokenImgSrc(
  token: Portfolio.Token.Info,
  defaultTokenInfo: Portfolio.Token.Info
): string {
  return token.ticker === defaultTokenInfo.ticker
    ? adaTokenImage
    : urlResolveForIpfsAndCorsproxy(token.originalImage) ?? defaultTokenImage;
}

export const tokenImg = (
  token: Portfolio.Token.Info,
  defaultTokenInfo: Portfolio.Token.Info,
  width: number | string = '24px',
  height: number | string = '24px'
): JSX.Element => {
  const theme = useTheme() as Theme & { name?: string };
  const fallbackImage =
    theme.name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;

  return (
    <Box
      width={width}
      height={height}
      sx={{
        overflowY: 'hidden',
        '& > svg': { width: '100%', height: '100%' },
        borderRadius: '4px',
      }}
    >
      <img
        width="100%"
        src={tokenImgSrc(token, defaultTokenInfo)}
        alt=""
        onError={(e): void => {
          (e.currentTarget as HTMLImageElement).src = fallbackImage;
        }}
      />
    </Box>
  );
};

const AssetPair = ({
  tokenIn,
  tokenOut,
  defaultTokenInfo,
  sx = {},
}: Props): JSX.Element => (
  <Box display="flex" alignItems="center" gap="8px" sx={sx}>
    <Box display="flex" alignItems="center" gap="8px">
      {tokenOut ? tokenImg(tokenOut, defaultTokenInfo) : null}
      <Box fontWeight={500} sx={{ color: 'ds.text_gray_medium' }}>
        {tokenOut?.ticker ?? '-'}
      </Box>
    </Box>

    <Box>/</Box>

    {/* TO token */}
    <Box
      display="flex"
      alignItems="center"
      gap="8px"
      sx={{ color: 'ds.text_gray_medium' }}
    >
      {tokenIn ? tokenImg(tokenIn, defaultTokenInfo) : null}
      <Box fontWeight={500}>{tokenIn?.ticker ?? '-'}</Box>
    </Box>
  </Box>
);

export default AssetPair;
