// @flow
import React from 'react';
import { Chip as MuiChip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material';

interface Props {
  label: string;
  active: boolean;
  sx: SxProps;
}

export const Chip = ({ label, active, sx, ...props }: Props): Node => {
  const theme = useTheme();

  return (
    <MuiChip
      label={label}
      {...props}
      sx={{
        maxWidth: 'fit-content',
        padding: '2px 6px !important',
        borderRadius: '20px',
        backgroundColor: active ? theme.palette.ds.secondary_c100 : theme.palette.ds.sys_magenta_c100,
        color: active ? theme.palette.ds.secondary_c800 : theme.palette.ds.sys_magenta_c700,
        ...sx,

        '& .MuiChip-label': {
          padding: 0,
        },
      }}
    ></MuiChip>
  );
};
