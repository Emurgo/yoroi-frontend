import { Input, InputAdornment, styled } from '@mui/material';
import { ReactComponent as SearchIcon } from '../../../assets/images/assets-page/search.inline.svg';
import { useRef } from 'react';

const StyledInput = styled(Input)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius}px`,
  width: '320px',
  height: '40px',
  padding: `${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1)}`,
  border: '1px solid',
  borderColor: theme.palette.ds.el_gray_low,
  'input::placeholder': {
    color: theme.palette.el_gray_medium,
  },
}));

const StyledInputAdornment = styled(InputAdornment)(({ theme }) => ({
  '&:hover': {
    cursor: 'pointer',
  },

  '> svg > use': {
    fill: theme.palette.ds.text_gray_normal,
  },
}));

export const SearchInput = props => {
  const ref = useRef();

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
        <StyledInputAdornment position="start" onClick={focusInput}>
          <SearchIcon />
        </StyledInputAdornment>
      }
      {...props}
    />
  );
};
