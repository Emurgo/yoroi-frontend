import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';
import { useGovernance } from '../module/GovernanceContextProvider';

type Props = {
  title: string;
  titleHover?: string;
  description: string;
  descriptionHover?: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  pending: boolean;
  loading: boolean;
};

const StyledCard: any = styled(Stack)(({ theme, selected, pending, isDrepSelected }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  height: '362px',
  borderRadius: '8px',
  border: `2px solid ${theme.palette.ds?.primary_100}`,

  ...(!selected &&
    {
      // backgroundColor: !pending && theme.palette.ds?.primary_100,
    }),
  ...(selected && {
    backgroundImage: !pending && theme.palette.ds.bg_gradient_2,
    border: '2px solid transparent',
    backgroundOrigin: 'border-box',
    pointerEvents: !isDrepSelected && 'none',
  }),
  cursor: 'pointer',
  ...(pending && {
    opacity: 0.5,
    cursor: 'not-allowed',
  }),
  '&:hover': {
    backgroundImage: theme.palette.ds.bg_gradient_2,
    border: '2px solid transparent',
    backgroundOrigin: 'border-box',
    // background: !pending && theme.palette.ds.bg_gradient_2,
    transition: 'opacity 1s ease-in-out',
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

export const GovernanceVoteingCard = ({
  title,
  description,
  descriptionHover,
  titleHover,
  icon,
  selected,
  onClick,
  pending = false,
  loading = false,
}: Props) => {
  const [hover, onHover] = React.useState(false);
  const { governanceStatus } = useGovernance();
  return (
    <div onMouseOver={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <StyledCard
        onClick={pending ? undefined : onClick}
        pending={pending === true ? 'true' : undefined}
        selected={selected}
        isDrepSelected={governanceStatus.status === 'delegate'}
      >
        {loading && (
          <SpinnerBox>
            <LoadingSpinner />
          </SpinnerBox>
        )}
        <CardContent>
          <IconContainer>{icon}</IconContainer>
          <Typography variant="h3" fontWeight="500" mt="16px">
            {hover && titleHover ? titleHover : title}
          </Typography>
          <Description variant="body2" color={'ds.gray_800'} style={{ wordWrap: 'break-word', maxWidth: '260px' }}>
            {descriptionHover && hover ? descriptionHover : description}
          </Description>
        </CardContent>
      </StyledCard>
    </div>
  );
};
