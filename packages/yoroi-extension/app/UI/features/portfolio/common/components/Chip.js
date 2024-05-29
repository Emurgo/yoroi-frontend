import React from 'react';
import { Chip as MuiChip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const Chip = props => {
  const theme = useTheme();

  return (
    <MuiChip
      label={props.label}
      {...props}
      sx={{
        maxWidth: 'fit-content',
        backgroundColor: props.active
          ? theme.palette.ds.secondary_c100
          : theme.palette.ds.sys_magenta_c100,
        color: props.active ? theme.palette.ds.secondary_c800 : theme.palette.ds.sys_magenta_c700,
        ...props.sx,
      }}
    ></MuiChip>
  );
};
