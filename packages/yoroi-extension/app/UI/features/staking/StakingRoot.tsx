import { Stack } from '@mui/material';
import { PoolList } from './useCases/PoolList/PoolList';
import { RewardsSummaryCard } from './useCases/RewardsSummary/RewardsSummaryCard';

export const StakingRoot = () => {
  return (
    <Stack>
      <RewardsSummaryCard />
      <PoolList />
    </Stack>
  );
};
