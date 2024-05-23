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
import { Button } from '@mui/material';
import Link from '@mui/material/Link';
import { useModal } from '../../../../context/ModalContext';

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
  paddingTop: '24px',
}));

const Description = styled(Typography)(({ theme }) => ({
  color: theme.palette.ds.gray_c800,
  marginTop: theme.spacing(1),
}));

const StyledCard = styled(Stack)(({ theme, selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  borderRadius: '8px',
  backgroundImage: theme.palette.ds?.bg_gradient_1,
  backgroundOrigin: 'border-box',
  boxShadow: 'inset 0 100vw white',
  border: '2px solid transparent',
  cursor: 'pointer',
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
  const { gouvernanceStatus, dRepId } = useGouvernance();
  const { openModal } = useModal();

  const pageTitle = gouvernanceStatus === 'none' ? 'Governance Status' : 'Governance status';
  const statusRawText = mapStatus[gouvernanceStatus];
  const pageSubtitle =
    gouvernanceStatus === 'none'
      ? 'Review the selections carefully to assign yourself a Governance Status'
      : `You have selected ${statusRawText} as your governance status. You can change it at any time by clicking in the card bellow`;

  const hasDRep = gouvernanceStatus === 'drep';

  const onChoosDRepClick = () => {
    openModal('ChooseDRepModal', { title: 'Choose your Drep' });
  };
  const handleCardClick = card => {
    setSelectedCard(card);
  };

  const optionsList = [
    {
      title: 'Delegate to a Drep',
      description:
        'You are designating someone else to cast your vote on your behalf for all proposals now and in the future.',
      icon: <DRepIlustration />,
      selected: selectedCard === 'drep',
      onClick: onChoosDRepClick,
    },
    {
      title: 'Abstain',
      description: 'You are choosing not to cast a vote on all proposals now and in the future.',
      icon: <Abstein />,
      selected: selectedCard === 'no-vote',
      onClick: () => handleCardClick('no-vote'),
    },
    {
      title: 'No Confidence',
      description: 'You are expressing a lack of trust for all proposals now and in the future.',
      icon: <NoConfidance />,
      selected: selectedCard === 'lack-of-trust',
      onClick: () => handleCardClick('lack-of-trust'),
    },
  ];

  return (
    <Container>
      <Typography variant="h3" fontWeight="500" mb={2} gutterBottom>
        {pageTitle}
      </Typography>
      <Typography variant="body1" mb="64px" gutterBottom>
        {pageSubtitle}
      </Typography>
      <Box display="flex" justifyContent="center" gap="24px">
        {optionsList.map((option, index) => {
          return (
            <GovernanceCard
              key={index}
              title={option.title}
              description={option.description}
              icon={option.icon}
              selected={option.selected}
              onClick={option.onClick}
            />
          );
        })}
      </Box>
      {gouvernanceStatus === 'none' && (
        <Stack gap="17px" mt="42px">
          <Link href="#" variant="body1">
            Want to became a Drep?
          </Link>
          <Link href="#" variant="body1">
            Learn more About Governance
          </Link>
        </Stack>
      )}

      {hasDRep && (
        <Stack gap="17px" mt="42px">
          <Typography variant="body2" align="center" color="textSecondary" gutterBottom>
            Drep ID: drep1c93a2zvs3aw8e4naez0ynpmc48jbc7yaa3n2k8ljhwfdt70yscts
          </Typography>
          <Link href="#" variant="body1">
            Learn more About Governance
          </Link>
        </Stack>
      )}
    </Container>
  );
};
