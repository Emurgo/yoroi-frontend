import React from 'react';
import { Skeleton as MuiSkeleton, SkeletonProps } from '@mui/material';

export const Skeleton = ({ width, height, ...props }: SkeletonProps): JSX.Element => {
  return (
    <MuiSkeleton
      width={width}
      height={height}
      variant="rectangular"
      animation={false}
      {...props}
      sx={(theme: any) => ({
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: theme.palette.ds.gray_c100,
        opacity: 0.8,
        ...props.sx,
      })}
    />
  );
};
