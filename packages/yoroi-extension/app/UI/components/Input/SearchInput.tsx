import React from 'react';
import { Input, InputAdornment, InputProps, styled, useTheme } from '@mui/material';
import { useRef } from 'react';
import { Icon } from './../icons/index';

const StyledInput = styled(Input)(({ theme }: any) => ({
  borderRadius: `${theme.shape.borderRadius}px`,
  width: '320px',
  height: '40px',
  padding: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1)}`,
  border: '1px solid',
  borderColor: theme.palette.ds.gray_c400,
  'input::placeholder': {
    color: theme.palette.ds.gray_c600,
  },
}));

export const SearchInput = (props: InputProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const theme: any = useTheme();

  const focusInput = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };

  return (
    <StyledInput
      inputRef={ref}
      disableUnderline
      startAdornment={
        <InputAdornment
          position="start"
          onClick={focusInput}
          sx={{
            cursor: 'pointer',
          }}
        >
          <Icon.Search fill={theme.palette.ds.gray_c900} />
        </InputAdornment>
      }
      {...props}
    />
  );
};
