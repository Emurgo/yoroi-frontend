// @flow
import React from 'react';
import { Skeleton as MuiSkeleton } from '@mui/material';

interface Props {
  width: string;
  height: string;
  sx?: any;
}

export const Skeleton = ({ width, height, sx, ...props }: Props): JSX.Element => {
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
        ...sx,
      })}
    />
  );
};
