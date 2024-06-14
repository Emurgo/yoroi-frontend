import React from 'react';
import { Chip as MuiChip, useTheme } from '@mui/material';

export const ChipTypes = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISABLED: 'disabled',
});

interface Props {
  label: JSX.Element;
  type: typeof ChipTypes[keyof typeof ChipTypes];
  sx?: any;
}

export const Chip = ({ label, type, sx, ...props }: Props): JSX.Element => {
  const theme: any = useTheme();

  const palettes = {
    active: {
      color: theme.palette.ds.secondary_c800,
      backgroundColor: theme.palette.ds.secondary_c100,
    },
    inactive: {
      color: theme.palette.ds.sys_magenta_c700,
      backgroundColor: theme.palette.ds.sys_magenta_c100,
    },
    disabled: {
      color: theme.palette.ds.gray_c600,
      backgroundColor: theme.palette.ds.gray_c100,
    },
  };

  return (
    <MuiChip
      label={label}
      {...props}
      sx={{
        maxWidth: 'fit-content',
        padding: '2px 6px !important',
        borderRadius: '20px',
        '& .MuiChip-label': {
          padding: 0,
        },
        ...palettes[type],
        ...sx,
      }}
    />
  );
};
