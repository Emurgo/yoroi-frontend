import { InputAdornment, InputProps, OutlinedInput, styled, useTheme } from '@mui/material';
import { useRef } from 'react';
import { Icon } from '../icons/index';

const StyledInput = styled(OutlinedInput)(({ theme }: any) => ({
  width: '320px',
  height: '40px',
  padding: '8px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_low,
    },
  },
  '& input::placeholder': {
    color: theme.palette.ds.el_gray_low,
    opacity: 1,
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
      startAdornment={
        <InputAdornment
          position="start"
          onClick={focusInput}
          sx={{
            cursor: 'pointer',
          }}
        >
          <Icon.Search fill={theme.palette.ds.gray_900} />
        </InputAdornment>
      }
      {...props}
    />
  );
};
