import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/system';

import { Portfolio } from '@yoroi/types';
import { TokenInfoIcon } from '../../../portfolio/common/components/TokenInfoIcon';
import { normalizeTokenId } from '../../common/helpers';
import { useSwapRevamp } from '../../module/SwapContextProvider';

type Props = {
  tokenInID: Portfolio.Token.Id;
  tokenOutID: Portfolio.Token.Id;
  sx?: SxProps<Theme>;
  defaultTokenInfo: Portfolio.Token.Info;
};

const AssetPair = ({ tokenInID, tokenOutID, defaultTokenInfo, sx = {} }: Props): React.ReactNode => {
  const { tokenInfos } = useSwapRevamp();
  const tokenIn = tokenInfos.get(tokenInID);
  const tokenOut = tokenInfos.get(tokenOutID);

  return (
    <Box display="flex" alignItems="center" gap="8px" sx={sx}>
      <Box display="flex" alignItems="center" gap="8px">
        <TokenInfoIcon
          info={{
            id: normalizeTokenId(tokenOutID),
          }}
          size="md"
        />
        <Box fontWeight={500} sx={{ color: 'ds.text_gray_medium' }}>
          {tokenOut?.ticker ?? defaultTokenInfo.ticker}
        </Box>
      </Box>

      <Box>/</Box>

      {/* TO token */}
      <Box display="flex" alignItems="center" gap="8px" sx={{ color: 'ds.text_gray_medium' }}>
        <TokenInfoIcon
          info={{
            id: normalizeTokenId(tokenInID),
          }}
          size="md"
        />
        <Box fontWeight={500}>{tokenIn?.ticker ?? defaultTokenInfo.ticker}</Box>
      </Box>
    </Box>
  );
};

export default AssetPair;
