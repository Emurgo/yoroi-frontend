import React from 'react';
import { Button, Typography } from '@mui/material';

interface Props {
  label: string;
  onClick: () => void;
  variant: any;
  sx?: any;
  width?: string;
}

const NavigationButton = ({ label, onClick, variant, sx, width, ...props }: Props) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      {...props}
      sx={(theme: any) => ({
        maxHeight: '40px',
        width: width || '140.25px',
        padding: '9px 20px !important',

        '&.MuiButton-contained': {
          backgroundColor: theme.palette.ds.el_primary_medium,
          color: theme.palette.ds.el_static_white,

          '&:hover': {
            backgroundColor: theme.palette.ds.el_primary_high,
          },
        },

        '&.MuiButton-secondary': {
          color: theme.palette.ds.text_primary_medium,
        },
        ...sx,
      })}
    >
      {/* @ts-ignore */}
      <Typography variant="button2">{label}</Typography>
    </Button>
  );
};

export default NavigationButton;
