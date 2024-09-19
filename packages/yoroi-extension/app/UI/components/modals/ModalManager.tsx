import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { Icon } from '../icons/index';
import { IconButtonWrapper } from '../wrappers/IconButtonWrapper';
import { useModal } from './ModalContext';

const BootstrapDialog: any = styled(Dialog)(({ theme, width, height }: { width: string; height: string; theme: any }) => ({
  '& .MuiDialogContent-root': {
    padding: '24px',
    backgroundColor: theme.palette.ds.bg_color_max,
  },
  '& .MuiDialog-root': {
    maxWidth: width,
    maxHeight: height,
    margin: 0,
  },
  '& .MuiPaper-root': {
    maxWidth: width,
    height: height,
    margin: 0,
  },
  '& .MuiDialogActions-root': {
    padding: '0px',
  },
}));

export const ModalManager = () => {
  const { height, width, closeModal, content, title, isOpen } = useModal();
  const theme = useTheme();

  return (
    <BootstrapDialog
      onClose={closeModal}
      aria-labelledby={`${title}-dialog-title`}
      open={isOpen}
      fullWidth
      width={width}
      height={height}
    >
      <DialogTitle sx={{ textAlign: 'center', p: '24px', backgroundColor: 'ds.bg_color_max' }} id={`${title}-dialog-title`}>
        <Typography variant="body1" fontWeight="500" lineHeight="22px" color="ds.gray_900">
          {title}
        </Typography>
      </DialogTitle>
      <IconButtonWrapper
        aria-label="close"
        onClick={closeModal}
        sx={{
          position: 'absolute',
          right: 18,
          top: 22,
        }}
      >
        <Icon.CloseIcon />
      </IconButtonWrapper>
      <DialogContent>{content}</DialogContent>
    </BootstrapDialog>
  );
};
