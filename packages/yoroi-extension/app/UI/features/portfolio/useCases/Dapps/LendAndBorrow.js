import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useStrings } from '../../common/useStrings';
import illustrationPng from '../../common/assets/images/illustration.png';

const LendAndBorrow = () => {
  const theme = useTheme();
  const strings = useStrings();

  return (
    <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
        <Box component="img" src={illustrationPng}></Box>
        <Typography variant="h4" fontWeight="500" color="ds.black_static">
          {strings.soonAvailable}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default LendAndBorrow;
