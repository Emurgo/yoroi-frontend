// @flow
import * as React from 'react';
import type { Node } from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useGouvernance } from '../../module/GouvernanceContextProvider';
import { DRepIlustration } from '../../common/ilustrations/DRepIlustration';
import { Abstein } from '../../common/ilustrations/Abstein';
import { NoConfidance } from '../../common/ilustrations/NoConfidance';
import { Stack } from '@mui/material';

type Props = {|
  title: string,
  description: string,
  icon: React.Node,
  selected: boolean,
  onClick: () => void,
|};

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  paddingBottom: '24px',
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.ds.gray_c800,
  marginTop: theme.spacing(1),
}));

const StyledCard = styled(Stack)(({ theme, selected }) => ({
  width: '294px',
  borderRadius: '16px',
  backgroundImage: theme.palette.ds?.bg_gradient_1,
  backgroundOrigin: 'border-box',
  boxShadow: 'inset 0 100vw white',
  border: '2px solid transparent',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
}));

const mapStatus = {
  drep: 'Delegate to a Drep',
  abstain: 'Abstaining',
  noConfidence: 'No confidence',
};

const GovernanceCard = ({ title, description, icon, selected, onClick }: Props) => (
  <StyledCard selected={selected} onClick={onClick}>
    <CardContent>
      <IconContainer>{icon}</IconContainer>
      <Typography variant="h3" fontWeight="500">
        {title}
      </Typography>
      <Description variant="body2">{description}</Description>
    </CardContent>
  </StyledCard>
);

export const GouvernanceStatusSelection = (): Node => {
  const [selectedCard, setSelectedCard] = useState(null);
  const { gouvernanceStatus } = useGouvernance();

  console.log('Test gouvernanceStatus', gouvernanceStatus);

  const pageTitle = gouvernanceStatus === 'none' ? 'Governance Status' : 'Governance status';
  const status = mapStatus[gouvernanceStatus];
  const pageSubtitle =
    gouvernanceStatus === 'none'
      ? 'Review the selections carefully to assign yourself a Governance Status'
      : `You have selected ${status} as your governance status. You can change it at any time by clicking in the card bellow`;

  const handleCardClick = card => {
    setSelectedCard(card);
  };

  return (
    <Container>
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom>
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="64px" gutterBottom>
        {pageSubtitle}
      </Typography>
      <Box display="flex" justifyContent="center" gap="24px">
        <GovernanceCard
          title="Delegating to a DRep"
          description="You are designating someone else to cast your vote on your behalf for all proposals now and in the future."
          icon={<DRepIlustration />}
          selected={selectedCard === 'drep'}
          onClick={() => handleCardClick('drep')}
        />
        <GovernanceCard
          title="No Vote"
          description="You are choosing not to cast a vote on all proposals now and in the future."
          icon={<Abstein />}
          selected={selectedCard === 'no-vote'}
          onClick={() => handleCardClick('no-vote')}
        />
        <GovernanceCard
          title="Lack of Trust"
          description="You are expressing a lack of trust for all proposals now and in the future."
          icon={<NoConfidance />}
          selected={selectedCard === 'lack-of-trust'}
          onClick={() => handleCardClick('lack-of-trust')}
        />
      </Box>
      {selectedCard && (
        <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
          Drep ID: drep1c93a2zvs3aw8e4naez0ynpmc48jbc7yaa3n2k8ljhwfdt70yscts
        </Typography>
      )}
    </Container>
  );
};
