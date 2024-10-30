import { Skeleton, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const StyledCard = styled(Stack)(({ theme }: any) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '294px',
  borderRadius: '8px',
  padding: '16px',
  border: `2px solid ${theme.palette.ds?.primary_100}`,
}));
export const VotingSkeletonCard = () => {
  return (
    <StyledCard>
      <Skeleton
        animation="wave"
        variant="rounded"
        width={157}
        height={180}
        sx={{ marginBottom: '22px', backgroundColor: 'ds.gray_100' }}
      />
      <Skeleton
        animation="wave"
        variant="rounded"
        width={185}
        height={22}
        sx={{ marginBottom: '12px', backgroundColor: 'ds.gray_100' }}
      />
      <Skeleton animation="wave" variant="rounded" width={262} height={88} sx={{ backgroundColor: 'ds.gray_100' }} />
    </StyledCard>
  );
};
