// @ts-nocheck
import React from 'react';
import { Button, Typography, styled } from '@mui/material';

const StyledButton = styled(Button)(({ theme }: any) => ({
  maxHeight: '40px',
  minWidth: '140.25px',

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
}));

const NavigationButton = ({ label, ...props }) => {
  return (
    <StyledButton {...props}>
      <Typography variant="button2">{label}</Typography>
    </StyledButton>
  );
};

export default NavigationButton;
