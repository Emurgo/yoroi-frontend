import { Stack } from '@mui/material';
import { PoolList } from './useCases/PoolList/PoolList';
import { RewardsSummaryCard } from './useCases/RewardsSummary/RewardsSummaryCard';
import { useStaking } from './module/StakingContextProvider';

export const StakingRoot = () => {
  const { delegatedRewards } = useStaking();
  return (
    <Stack>
      <RewardsSummaryCard />
      <PoolList />
    </Stack>
  );
};
