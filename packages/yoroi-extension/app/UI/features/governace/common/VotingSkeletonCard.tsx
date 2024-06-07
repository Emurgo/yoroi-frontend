// @flow
import * as React from 'react';
import { Stack } from '@mui/material';
import { Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Stack)(({ theme }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  borderRadius: '8px',
  padding: '16px',
  backgroundImage: theme.palette.ds?.bg_gradient_1,
  backgroundOrigin: 'border-box',
  boxShadow: 'inset 0 100vw white',
  border: '2px solid transparent',
}));
export const VotingSkeletonCard = () => {
  return (
    <StyledCard>
      <Skeleton animation="wave" variant="rounded" width={157} height={180} sx={{ marginBottom: '22px' }} />
      <Skeleton animation="wave" variant="rounded" width={185} height={22} sx={{ marginBottom: '12px' }} />
      <Skeleton animation="wave" variant="rounded" width={262} height={88} />
    </StyledCard>
  );
};
