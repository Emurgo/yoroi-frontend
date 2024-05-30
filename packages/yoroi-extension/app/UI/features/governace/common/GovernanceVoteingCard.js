// @flow
import * as React from 'react';
import type { Node } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';

type Props = {|
  title: string,
  description: string,
  icon: React.Node,
  selected: boolean,
  onClick: () => void,
  pending: boolean,
|};

const StyledCard = styled(Stack)(({ theme, selected, pending }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  borderRadius: '8px',
  ...(!selected && {
    backgroundImage: theme.palette.ds?.bg_gradient_1,
    backgroundOrigin: 'border-box',
    boxShadow: 'inset 0 100vw white',
    border: '2px solid transparent',
  }),
  ...(selected && {
    background: theme.palette.ds.bg_gradient_2,
    border: 'none',
  }),
  cursor: 'pointer',
  ...(pending && {
    opacity: selected ? 1 : 0.5,
    cursor: 'not-allowed',
  }),
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
}));

const Description = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const SpinnerBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 15,
  top: 15,
}));

export const GovernanceVoteingCard = ({ title, description, icon, selected, onClick, pending }: Props): Node => (
  <StyledCard selected={selected} onClick={pending ? undefined : onClick} pending={pending}>
    {pending && selected && (
      <SpinnerBox>
        <LoadingSpinner />
      </SpinnerBox>
    )}
    <CardContent>
      <IconContainer>{icon}</IconContainer>
      <Typography variant="h3" fontWeight="500">
        {title}
      </Typography>
      <Description variant="body2" color={'ds.gray_c800'}>
        {description}
      </Description>
    </CardContent>
  </StyledCard>
);
