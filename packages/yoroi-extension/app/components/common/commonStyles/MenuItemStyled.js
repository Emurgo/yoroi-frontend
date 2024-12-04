import { MenuItem, styled } from "@mui/material";

export const MenuItemStyled = styled(MenuItem)(({ theme }: any) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.ds.bg_color_contrast_min,
    '&:hover': {
      backgroundColor: theme.palette.ds.bg_color_contrast_min,
    },
    '&::after': {
      borderColor: theme.palette.ds.secondary_600,
      width: '18px',
      transform: 'rotate(-45deg) scale(-1, 1)',
    },
    '&.Mui-focusVisible': {
      backgroundColor: theme.palette.ds.bg_color_contrast_min,
    },
  },
  backgroundColor: theme.palette.ds.bg_color_contrast_high,
  opacity: '1',
  '&:hover': {
    backgroundColor: theme.palette.ds.bg_color_contrast_min,
  },
}));
