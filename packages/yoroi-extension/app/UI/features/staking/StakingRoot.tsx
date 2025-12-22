import { Box, Stack, styled } from '@mui/material';
import { PoolList } from './useCases/PoolList/PoolList';
import { RewardsSummaryCard } from './useCases/RewardsSummary/RewardsSummaryCard';
import { StakePoolDelegated } from './useCases/DelegatedStakePoolInfo/StakePoolDelegated';
import EpochProgress from './useCases/EpochProgress/EpochProgress';
import { LegacyDialogs } from './useCases/LegacyDialogs/LegacyDialogs';
import { useStaking } from './module/StakingContextProvider';
import BuySellDialog from '../../../components/buySell/BuySellDialog';
import WalletEmptyBanner from './common/components/EmptyWalletBanner';

export const StakingRoot = () => {
  const { isWalletWithNoFunds, selectedWallet, legacyUIDialogs, currentlyDelegating } = useStaking();

  return (
    <Stack>
      {isWalletWithNoFunds ? (
        <WalletEmptyBanner
          onBuySellClick={() => legacyUIDialogs.open({ dialog: BuySellDialog })}
          isTestnet={selectedWallet.isTestnet}
        />
      ) : null}
      {currentlyDelegating && (
        <WrapperCards>
          <RewardsSummaryCard />
          <RightCardsWrapper>
            <StakePoolDelegated />
            <EpochProgress />
          </RightCardsWrapper>
        </WrapperCards>
      )}
      <PoolList />
      <LegacyDialogs />
    </Stack>
  );
};

const WrapperCards = styled(Box)({
  display: 'flex',
  gap: '24px',
  justifyContent: 'space-between',
  marginBottom: '24px',
});

const RightCardsWrapper = styled(Box)({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  gap: '24px',
});
