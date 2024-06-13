import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps, styled } from '@mui/material';

const StyledSkeleton = styled(MuiSkeleton)(({ theme }: any) => ({
  borderRadius: `${theme.shape.borderRadius}px`,
  backgroundColor: theme.palette.ds.gray_c100,
  opacity: 0.8,
}));

export const Skeleton = ({ width, height, ...props }: SkeletonProps): JSX.Element => {
  return <StyledSkeleton width={width} height={height} variant="rectangular" animation={false} {...props} />;
};
