// @flow
import type { Node } from 'react';
import { Box } from '@mui/system';
import { Stack, Typography } from '@mui/material';

type Props = {||};

function HistoryRow() {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography color="var(--yoroi-palette-gray-900)">Received</Typography>
        <Typography variant="body3" color="var(--yoroi-palette-gray-600)">
          23 Jul, 11:30pm
        </Typography>
      </Box>
      <Typography color="var(--yoroi-palette-gray-900)">+ 100101010.212 ADA</Typography>
    </Box>
  );
}

function RewardHistoryTab(props: Props): Node {
  return (
    <Box >
      <Typography
        as="button"
        variant="body2"
        color="var(--yoroi-palette-gray-600)"
        display="block"
        marginLeft="auto"
        marginBottom="20px"
      >
        Open reward list
      </Typography>
      <Box>
        <Box marginBottom="20px">
          <Typography color="var(--yoroi-palette-gray-600)">Stake Pool</Typography>
          <Typography>Avatar - Emurgo [Emrugo]</Typography>
        </Box>
        <Stack spacing="22px">
          <HistoryRow />
          <HistoryRow />
          <HistoryRow />
          <HistoryRow />
          <HistoryRow />
          <HistoryRow />
        </Stack>
      </Box>
    </Box>
  );
}
export default RewardHistoryTab;
