import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  pending: boolean;
};

const StyledCard: any = styled(Stack)(({ theme, selected, pending }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  height: '362px',
  borderRadius: '8px',

  ...(!selected && {
    background: theme.name === 'light-theme' ? theme.palette.ds?.bg_gradient_1 : theme.palette.ds?.bg_gradient_2,
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
  '&:hover': {
    background: theme.palette.ds.bg_gradient_1,
    backgroundOrigin: 'content-box',
    boxShadow: 'none',
    transition: 'all 250ms ease-in-out',
  },
}));

const IconContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
}));

const Description = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const SpinnerBox = styled(Box)(() => ({
  position: 'absolute',
  right: 15,
  top: 15,
}));

export const GovernanceVoteingCard = ({ title, description, icon, selected, onClick, pending }: Props) => {
  return (
    <StyledCard onClick={pending ? undefined : onClick} pending={pending} selected={selected}>
      {pending && selected && (
        <SpinnerBox>
          <LoadingSpinner />
        </SpinnerBox>
      )}
      <CardContent>
        <IconContainer>{icon}</IconContainer>
        <Typography variant="h3" fontWeight="500" mt="16px">
          {title}
        </Typography>
        <Description variant="body2" color={'ds.gray_c800'}>
          {description}
        </Description>
      </CardContent>
    </StyledCard>
  );
};
