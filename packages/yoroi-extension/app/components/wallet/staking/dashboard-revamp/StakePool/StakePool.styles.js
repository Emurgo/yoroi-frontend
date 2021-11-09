// @flow
import { Box, styled } from '@mui/system';
import { Link } from '@mui/material';

export const List: any = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

export const StyledLink: any = styled(Link)({
  color: 'white',
  opacity: 0.5,
  marginRight: '5px',
  '&:hover': {
    opacity: 1,
  },
});
