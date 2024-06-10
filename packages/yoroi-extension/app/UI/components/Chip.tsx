// @flow
import React from 'react';
import { Chip as MuiChip } from '@mui/material';

interface Props {
  label: string;
  active: boolean;
  sx: any;
}

export const Chip = ({ label, active, sx, ...props }: Props): JSX.Element => {
  return (
    <MuiChip
      label={label}
      {...props}
      sx={(theme: any) => ({
        maxWidth: 'fit-content',
        padding: '2px 6px !important',
        borderRadius: '20px',
        backgroundColor: active ? theme.palette.ds.secondary_c100 : theme.palette.ds.sys_magenta_c100,
        color: active ? theme.palette.ds.secondary_c800 : theme.palette.ds.sys_magenta_c700,
        ...sx,

        '& .MuiChip-label': {
          padding: 0,
        },
      })}
    ></MuiChip>
  );
};
