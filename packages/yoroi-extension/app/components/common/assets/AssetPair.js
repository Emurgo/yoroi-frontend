//@flow
import { Box } from '@mui/material';
import type { AssetAmount } from '../../swap/types';

type Props = {|
  from: AssetAmount,
  to: AssetAmount,
  sx?: any,
|};

export default function AssetPair({ from, to, sx = {} }: Props): React$Node {
  return (
    <Box display="flex" alignItems="center" gap="8px" sx={sx}>
      <Box display="flex" alignItems="center" gap="8px">
        <Box width="24px" height="24px">
          {from.image}
        </Box>
        <Box fontWeight={500}>{from.ticker}</Box>
      </Box>
      <Box>/</Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Box width="24px" height="24px">
          {to.image}
        </Box>
        <Box fontWeight={500}>{to.ticker}</Box>
      </Box>
    </Box>
  );
}
