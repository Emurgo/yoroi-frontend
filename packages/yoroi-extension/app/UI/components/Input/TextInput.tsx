// @flow

import React from 'react';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

type StyledInputProps = {
  id: string;
  label: string;
  variant: string;
  onChange: (event: any) => void;
  value?: string;
  error?: boolean;
  helperText?: string;
};

export const TextInput = ({ id, label, onChange, value, error, helperText }: StyledInputProps) => {
  return (
    <SInput id={id} label={label} variant="outlined" onChange={onChange} value={value} error={error} helperText={helperText} />
  );
};

const SInput = styled(TextField)(({ theme, error }: any) => ({
  '& .MuiFormHelperText-root': {
    position: 'absolute',
    bottom: -2,
    left: -10,
  },
  '& .MuiInputLabel-root': {
    color: error && theme.palette.ds.sys_magenta_c500,
  },
}));
