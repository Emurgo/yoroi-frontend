//@flow
import { Box } from '@mui/material';

export default function AssetPair({ from, to, sx = {} }) {
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
