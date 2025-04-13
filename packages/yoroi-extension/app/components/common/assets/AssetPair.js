//@flow
import { Box, useTheme } from '@mui/material';
import adaTokenImage from '../../../assets/images/ada.inline.svg';
import defaultTokenImage from '../../../assets/images/revamp/token-default.inline.svg';
import defaultTokenDarkImage from '../../../assets/images/revamp/asset-default-dark.inline.svg';
import { urlResolveForIpfsAndCorsproxy } from '../../../coreUtils';
import type { AssetAmount } from '../../swap/types';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';

type Props = {|
  from: AssetAmount,
  to: AssetAmount,
  sx?: any,
  defaultTokenInfo: RemoteTokenInfo,
|};

function tokenImgSrc(token, defaultTokenInfo): string {
  return token.ticker === defaultTokenInfo.ticker
    ? adaTokenImage
    : urlResolveForIpfsAndCorsproxy(token.image) ?? defaultTokenImage;
}

export const tokenImg = (token: any, defaultTokenInfo: any, width?: any, height?: any): React$Node => {
  const theme = useTheme();
  const defaultImage = theme.name === 'dark-theme' ? defaultTokenDarkImage : defaultTokenImage;
  return (
    <Box
      width={width ?? '24px'}
      height={height ?? '24px'}
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
        onError={e => {
          e.target.src = defaultImage;
        }}
      />
    </Box>
  );
};

export default function AssetPair({ from, to, defaultTokenInfo, sx = {} }: Props): React$Node {
  return (
    <Box display="flex" alignItems="center" gap="8px" sx={sx}>
      <Box display="flex" alignItems="center" gap="8px">
        {tokenImg(from, defaultTokenInfo)}
        <Box fontWeight={500} sx={{ color: 'ds.text_gray_medium' }}>
          {from?.ticker ?? '-'}
        </Box>
      </Box>
      <Box>/</Box>
      <Box display="flex" alignItems="center" gap="8px" sx={{ color: 'ds.text_gray_medium' }}>
        {tokenImg(to, defaultTokenInfo)}
        <Box fontWeight={500}>{to?.ticker ?? '-'}</Box>
      </Box>
    </Box>
  );
}
