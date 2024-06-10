// @flow
import React from 'react';
import { Input, InputAdornment, styled } from '@mui/material';
import { useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Icon } from './../icons/index';

const StyledInput = styled(Input)(({ theme }: { theme: any }) => ({
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

const StyledInputAdornment = styled(InputAdornment)(({ theme }: { theme: any }) => ({
  '&:hover': {
    cursor: 'pointer',
  },

  '& > svg > use': {
    fill: theme.palette.ds.gray_c900,
  },
}));

export const SearchInput = props => {
  const theme = useTheme();
  const ref = useRef<HTMLInputElement>(null);

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
        <StyledInputAdornment position="start" onClick={focusInput} theme={theme}>
          <Icon.Search />
        </StyledInputAdornment>
      }
      {...props}
    />
  );
};
