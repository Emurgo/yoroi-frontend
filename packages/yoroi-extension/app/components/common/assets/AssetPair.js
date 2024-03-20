//@flow
import { Box } from '@mui/material';
import type { AssetAmount } from '../../swap/types';
import adaTokenImage from '../../../containers/swap/mockAssets/ada.inline.svg';
import { urlResolveForIpfsAndCorsproxy } from '../../../coreUtils';
import defaultTokenImage from '../../../assets/images/revamp/token-default.inline.svg';

type Props = {|
  from: AssetAmount,
  to: AssetAmount,
  sx?: any,
|};

function tokenImgSrc(token, defaultTokenInfo): string {
  const src = token.ticker === defaultTokenInfo.ticker ? adaTokenImage
    : (urlResolveForIpfsAndCorsproxy(token.image) ?? defaultTokenImage);
  console.log('>>> ', token.ticker, token.image, src);
  return src;
}

function tokenImg(token, defaultTokenInfo): Node {
  return (
    <Box
      width="24px"
      height="24px"
      sx={{ overflowY: 'hidden', '& > svg': { width: '100%', height: '100%' } }}
    >
      <img
        width="100%"
        src={tokenImgSrc(token, defaultTokenInfo)}
        alt=""
        onError={e => {
          e.target.src = defaultTokenImage;
        }}
      />
    </Box>
  )
}

export default function AssetPair({ from, to, defaultTokenInfo, sx = {} }: Props): React$Node {
  return (
    <Box display="flex" alignItems="center" gap="8px" sx={sx}>
      <Box display="flex" alignItems="center" gap="8px">
        {tokenImg(from, defaultTokenInfo)}
        <Box fontWeight={500}>{from?.ticker ?? '-'}</Box>
      </Box>
      <Box>/</Box>
      <Box display="flex" alignItems="center" gap="8px">
        {tokenImg(to, defaultTokenInfo)}
        <Box fontWeight={500}>{to?.ticker ?? '-'}</Box>
      </Box>
    </Box>
  );
}
