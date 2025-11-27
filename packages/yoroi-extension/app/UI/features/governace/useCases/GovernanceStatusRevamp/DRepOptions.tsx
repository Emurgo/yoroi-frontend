import { Box, Typography, Button, Stack, Link } from '@mui/material';
import { styled } from '@mui/system';
import { useState } from 'react';
import { Icon } from '../../../../components';
import { useNavigateTo } from '../../common/useNavigateTo';

interface DRepOptionsScreenProps {}

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  variant: 'primary' | 'outlined';
  icon?: React.ReactNode;
  onAction: () => void;
  onViewDetails?: () => void;
}

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',
}));

const TitleSection = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0px',
  gap: '8px',

  width: '1248px',
  height: '58px',

  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardsRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  gap: '24px',

  width: '1248px',
  height: '320px',

  flex: 'none',
  order: 1,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const ActionCardContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant',
})<{ variant: 'primary' | 'outlined' }>(({ theme, variant }) => ({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '16px',
  gap: variant === 'primary' ? '16px' : '12px',

  width: '294px',
  height: '320px',

  background: variant === 'primary' ? 'linear-gradient(312.19deg, #C6F7ED 0%, #E4E8F7 70.58%)' : '#FFFFFF',
  border: variant === 'outlined' ? '1px solid #DCE0E9' : 'none',
  borderRadius: '8px',

  flex: 'none',
  alignSelf: 'stretch',
  flexGrow: 1,
}));

const CardWrapper = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '0px',
  gap: '8px',

  margin: '0 auto',
  width: '262px',
  // height differs slightly in Figma between cards; use 152px to fit primary spec
  height: 'auto',

  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardTitleRow = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '0px',
  gap: '12px',

  width: '262px',
  height: '48px',

  flex: 'none',
  order: 0,
  alignSelf: 'stretch',
  flexGrow: 0,
}));

const CardIcon = styled(Box, {
  shouldForwardProp: prop => prop !== 'variant',
})<{ variant: 'primary' | 'outlined' }>(({ variant }) => ({
  width: '48px',
  height: '48px',
  background: variant === 'primary' ? '#4B6DDE' : '#EAEDF2',
  borderRadius: '1200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  flex: 'none',
  order: 0,
  flexGrow: 0,
}));

const CTASet = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
}));

const ActionCard: React.FC<ActionCardProps> = ({ title, description, buttonText, variant, icon, onAction, onViewDetails }) => {
  return (
    <ActionCardContainer variant={variant}>
      <CardWrapper>
        <CardTitleRow>
          <CardIcon variant={variant}>
            {icon || (
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="13.5" cy="13.5" r="11.25" fill={variant === 'primary' ? '#FFFFFF' : '#000000'} />
              </svg>
            )}
          </CardIcon>

          {/* Title */}
          <Typography
            sx={{
              width: '202px',
              height: '26px',
              fontFamily: 'Rubik',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '26px',
              color: '#242838',

              flex: 'none',
              order: 1,
              flexGrow: 1,
            }}
          >
            {title}
          </Typography>
        </CardTitleRow>

        {/* Description */}
        <Typography
          sx={{
            width: '262px',
            // Figma suggests 96px/72px; let text be auto-height to avoid clipping
            fontFamily: 'Rubik',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#242838',

            flex: 'none',
            order: 1,
            alignSelf: 'stretch',
            flexGrow: 0,
          }}
        >
          {description}
        </Typography>
      </CardWrapper>

      <CTASet>
        {variant === 'primary' ? (
          <Stack direction="column" spacing={12} width="100%">
            {/* @ts-ignore */}
            <Button variant="primary" onClick={onAction} fullWidth>
              {buttonText}
            </Button>
            {onViewDetails && <Link textAlign="center">See Yoroi’s voting record</Link>}
          </Stack>
        ) : (
          <Button variant="outlined" onClick={onAction} fullWidth>
            {buttonText}
          </Button>
        )}
      </CTASet>
    </ActionCardContainer>
  );
};

export const DRepOptions: React.FC<DRepOptionsScreenProps> = () => {
  const navigateTo = useNavigateTo();
  const onBack = () => {
    navigateTo.selectRevampStatus();
  };

  return (
    <Container>
      <Stack direction="row" alignSelf={'flex-start'} spacing={6} sx={{ cursor: 'pointer' }} onClick={onBack}>
        <Icon.LeftArrow />
        <Typography variant="body1" fontWeight={500} textTransform="uppercase">
          back to dashboard
        </Typography>
      </Stack>

      <TitleSection>
        <Typography variant="h5">Choose How to Use Your Voting Power</Typography>
        <Typography variant="body1" color="ds.text_gray_low">
          You can let Yoroi’s DRep vote for you, pick another DRep using their ID, or choose to abstain or show no confidence.
        </Typography>
      </TitleSection>

      <CardsRow>
        <ActionCard
          title="Yoroi DRep"
          description="Support the Commercial and Technical adoption of the Cardano roadmap. Please note Yoroi is part of the EMURGO Group."
          buttonText="DELEGATE"
          variant="primary"
          icon={<Icon.YoroiLogo fill="white" />}
          onAction={() => console.log('Delegate to Yoroi')}
          onViewDetails={() => console.log('View Yoroi details')}
        />

        <ActionCard
          title="Browse DReps"
          description="Explore the full list of registered DReps and choose one that aligns with your governance preferences."
          buttonText="BROWSE"
          variant="outlined"
          icon={<Icon.VotingDrep />}
          onAction={() => console.log('Browse DReps')}
        />

        <ActionCard
          title="Abstain"
          description="Choose to abstain from voting while still participating in the governance process and earning rewards."
          buttonText="ABSTAIN"
          variant="outlined"
          icon={<Icon.VotingAbstain />}
          onAction={() => console.log('Abstain')}
        />

        <ActionCard
          title="No Confidence"
          description="Signal no confidence in the current governance system by delegating to the predefined No Confidence DRep."
          buttonText="SELECT"
          variant="outlined"
          icon={<Icon.VotingNoConfidence />}
          onAction={() => console.log('No Confidence')}
        />
      </CardsRow>
    </Container>
  );
};
