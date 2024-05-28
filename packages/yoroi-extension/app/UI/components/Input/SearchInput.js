import { Input, styled } from '@mui/material';

const StyledInput = styled(Input)(({ theme }) => ({
  borderRadius: `${theme.shape.borderRadius}px`,
  width: '320px',
  height: '40px',
  padding: '8px 16px 8px 8px',
  backgroundColor: 'transparent',
  border: '1px solid',
  borderColor: theme.palette.grayscale[400],
  'input::placeholder': {
    color: theme.palette.grayscale[600],
  },
}));

export const SearchInput = props => {
  return <StyledInput {...props} />;
};
