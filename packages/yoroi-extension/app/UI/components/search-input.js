import { Input, styled } from '@mui/material';

export const SearchInput = styled(Input)(({ theme }) => ({
  borderRadius: '8px',
  width: '370px',
  height: '40px',
  padding: '10px 12px',
  backgroundColor: theme.palette.grayscale['50'],
  border: '1px solid',
  borderColor: theme.palette.grayscale['400'],
  'input::placeholder': {
    color: theme.palette.grayscale['600'],
  },
}));
