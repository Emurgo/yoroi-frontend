// @flow
import React from 'react';
import { Skeleton as MuiSkeleton } from '@mui/material';
import type { SxProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface Props {
  sx: SxProps;
}

export const Skeleton = ({ sx, ...props }: Props): JSX.Element => {
  const theme: any = useTheme();

  return (
    <MuiSkeleton
      variant="rectangular"
      animation={false}
      {...props}
      sx={{
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: theme.palette.ds.gray_c100,
        opacity: 0.8,
        ...sx,
      }}
    />
  );
};
