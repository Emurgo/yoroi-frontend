// features/governace/useCases/GovernanceStatusRevamp/GovernanceStatusRevamp.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography, Button } from '@mui/material';
import { GovernanceStatusRevampCard, GovernanceStatusState } from './GovernanceStatusRevampCard';
import { useNavigateTo } from '../../common/useNavigateTo';

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
  width: '612px',
  margin: '0 auto',
  marginTop: '24px',
}));

const TitleSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '8px',
  width: '612px',
}));

const CardsContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '16px',
  width: '612px',
}));

const OtherActionsCard = styled(Button)(({ theme }: any) => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  gap: '4px',
  width: '612px',
  border: `1px solid ${theme.palette.ds.gray_200}`,
  borderRadius: '8px',
  cursor: 'pointer',
  textTransform: 'none',
  '&:hover': {
    background: theme.palette.background.paper,
    borderColor: theme.palette.ds.primary_500,
  },
}));

const TextContent = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '4px',
  width: '580px',
}));

export const GovernanceStatusRevamp = () => {
  const navigateTo = useNavigateTo();
  // For now we keep it "idle"; you I can wire this from props/stores
  const cardState: GovernanceStatusState = 'idle';

  const onExploreMore = () => {
    navigateTo.selectRevampOptions()
  };

  return (
    <Container>
      <TitleSection>
        <Typography variant="h5" color="ds.text_gray_medium">
          Delegation Options
        </Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          Choose to delegate your voting power to Yoroi DRep or explore other options
        </Typography>
      </TitleSection>

      {/* Cards */}
      <CardsContainer>
        <GovernanceStatusRevampCard
          state={cardState}
          drepId="drep1qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnmqwerty"
          votingPowerValue="—"
          delegatedAmountValue="—"
          onDelegateClick={() => {
            // later: route to delegation flow
            // console.log('Delegate clicked')
          }}
          onDetailsClick={() => {
            // later: open governance docs / modal
            // console.log('View governance details')
          }}
        />

        <OtherActionsCard onClick={onExploreMore}>
          <TextContent>
            <Typography variant="body1" fontWeight={500} color="ds.gray_max">
              Explore other DReps or Abstain
            </Typography>
            <Typography variant="body2" color="ds.text_gray_medium">
              Browse additional delegation options or choose to abstain from voting
            </Typography>
          </TextContent>
        </OtherActionsCard>
      </CardsContainer>
    </Container>
  );
};
