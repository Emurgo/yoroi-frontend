import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Icon } from '../icons/index';
import { useModal } from './ModalContext';

const BootstrapDialog: any = styled(Dialog)(({ width, height }: { width: string; height: string }) => ({
  '& .MuiDialogContent-root': {
    padding: '24px',
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

  return (
    <BootstrapDialog
      onClose={closeModal}
      aria-labelledby={`${title}-dialog-title`}
      open={isOpen}
      fullWidth
      width={width}
      height={height}
    >
      <DialogTitle sx={{ textAlign: 'center', p: '24px' }} id={`${title}-dialog-title`}>
        <Typography variant="body1" fontWeight="500" lineHeight="22px">
          {title}
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={{
          position: 'absolute',
          right: 18,
          top: 22,
          color: (theme: any) => theme.palette.ds.gray_500,
        }}
      >
        <Icon.CloseIcon />
      </IconButton>
      <DialogContent>{content}</DialogContent>
    </BootstrapDialog>
  );
};
