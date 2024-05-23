import { Input, styled } from '@mui/material';

export const SearchInput = styled(Input)(({ theme }) => ({
  borderRadius: '8px',
  width: '370px',
  height: '40px',
  padding: '10px 12px',
  backgroundColor: theme.palette.ds.white_static,
  border: '1px solid',
  borderColor: theme.palette.ds.gray_c300,
  'input::placeholder': {
    color: theme.palette.ds.text_gray_medium,
  },
}));
