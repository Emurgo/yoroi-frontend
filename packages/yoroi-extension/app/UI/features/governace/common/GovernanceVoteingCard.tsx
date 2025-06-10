import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';
import { useGovernance } from '../module/GovernanceContextProvider';
import { YOROI_DREP_ID } from './constants';

type Props = {
  title: string;
  titleHover?: string;
  description: string;
  descriptionHover?: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  pending: boolean;
  loading: boolean;
  blocked: boolean;
  smallCard?: boolean;
  isVisible?: boolean;
  extraInfo?: string | null;
  bottom?: React.ReactNode;
};

const StyledCard: any = styled(Stack)(({ theme, selected, pending, blocked, smallCard }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: smallCard ? '298px' : '612px',
  padding: '16px',
  minHeight: '126px',
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
  }),
  cursor: 'pointer',
  ...(pending && {
    opacity: 0.5,
    cursor: 'not-allowed',
  }),
  '&:hover': {
    backgroundImage: !blocked && theme.palette.ds.bg_gradient_1,
    border: !blocked && '2px solid transparent',
    backgroundOrigin: !blocked && 'border-box',
    transition: !blocked && 'opacity 1s ease-in-out',
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
  smallCard,
  isVisible,
  extraInfo,
  blocked,
  bottom,
}: Props) => {

  const [hover, onHover] = React.useState(false);
  const { governanceStatus } = useGovernance();
  if (isVisible === false) return <></>;
  return (
    <div onMouseOver={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <StyledCard
        onClick={pending || blocked ? undefined : onClick}
        pending={pending ? 'true' : undefined}
        selected={selected}
        blocked={String(governanceStatus.status === 'delegate' && governanceStatus.drep !== YOROI_DREP_ID)}
        smallCard={smallCard}
      >
        {loading && (
          <SpinnerBox>
            <LoadingSpinner />
          </SpinnerBox>
        )}
        <Stack direction="column" px="16px">
          <IconContainer>{icon}</IconContainer>
          <Typography variant="h3" fontSize="18px" fontWeight="500" mt="8px">
            {hover && titleHover ? titleHover : title}
          </Typography>
          <Description variant="body2" color="ds.gray_800"  whiteSpace="pre-line" style={{ wordWrap: 'break-word', maxWidth: '580px' }}>
            {descriptionHover && hover ? descriptionHover : description}
          </Description>
        </Stack>
        {extraInfo && (
          <Typography variant="body2" fontWeight="500" color="ds.text_gray_medium">
            {extraInfo}
          </Typography>
        )}
        {bottom}
      </StyledCard>
    </div>
  );
};
