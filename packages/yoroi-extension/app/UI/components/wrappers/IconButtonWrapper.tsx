import { IconButton, styled } from '@mui/material';

export const IconButtonWrapper = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));
