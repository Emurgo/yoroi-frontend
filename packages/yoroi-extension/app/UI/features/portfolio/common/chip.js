import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StyledChip = props => {
  const theme = useTheme();

  return (
    <Chip
      label={props.label}
      {...props}
      sx={{
        backgroundColor: props.active
          ? theme.palette.ds.secondary_c100
          : theme.palette.ds.sys_magenta_c100,
        color: props.active ? theme.palette.ds.secondary_c800 : theme.palette.ds.sys_magenta_c700,
        ...props.sx,
      }}
    ></Chip>
  );
};

export default StyledChip;
