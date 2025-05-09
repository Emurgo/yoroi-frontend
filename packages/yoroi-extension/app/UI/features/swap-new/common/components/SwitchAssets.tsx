import { IconButton, styled } from '@mui/material';
import React from 'react';
import { Icons, IconWrapper } from '../../../../components';

export const SwitchAssets = () => {
  return (
    <Wrapper>
      <IconWrapper icon={Icons.Swap} color="ds.el_primary_medium" />
    </Wrapper>
  );
};
const Wrapper = styled(IconButton)(({ theme }: any) => ({
  border: '2px solid',
  borderColor: theme.palette.ds.bg_color_max,
  borderRadius: '50px',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.ds.bg_color_contrast_min,
  position: 'absolute',
  top: '32%',
  left: '45%',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.ds.bg_color_contrast_min,
  },
}));
