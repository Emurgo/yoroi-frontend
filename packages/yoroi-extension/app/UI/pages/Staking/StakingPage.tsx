import { Stack, Typography } from '@mui/material';
import PoolList from './useCases/PoolList/PoolList';

export const StakingPage = () => {
  return (
    <Stack>
      <Typography variant="h2">MAINSTAKING PAGE </Typography>
      <PoolList />
    </Stack>
  );
};
