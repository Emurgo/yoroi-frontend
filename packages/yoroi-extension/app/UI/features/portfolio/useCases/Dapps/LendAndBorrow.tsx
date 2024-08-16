import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import noResultsPng from '../../common/assets/illustrations/no-results.png';

const LendAndBorrow = () => {
  const theme = useTheme();
  const strings = useStrings();

  return (
    <Stack width="full" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
      <Stack direction="column" alignItems="center" spacing={theme.spacing(3)}>
        <Box component="img" src={noResultsPng}></Box>
        <Typography variant="h4" fontWeight="500" color="ds.black_static" sx={{ lineHeight: '30px' }}>
          {strings.soonAvailable}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default LendAndBorrow;
