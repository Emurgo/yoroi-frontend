// @flow
import { Box, styled } from '@mui/system';
import { Link } from '@mui/material';

export const List: any = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

export const StyledLink: any = styled(Link)(({ theme }) => ({
  marginRight: '5px',
  color: 'inherit',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
