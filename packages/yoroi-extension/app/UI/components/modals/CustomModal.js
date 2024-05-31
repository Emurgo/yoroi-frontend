// @flow

import * as React from 'react';
import type { Node } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Icon } from '../icons/index';
import { useModal } from './ModalContext';

const BootstrapDialog = styled(Dialog)(({ theme, width }) => ({
  '& .MuiDialogContent-root': {
    padding: '24px',
  },
  '& .MuiDialog-root': {
    maxWidth: width,
    margin: 0,
  },
  '& .MuiPaper-root': {
    maxWidth: width,
    margin: 0,
  },
  '& .MuiDialogActions-root': {
    padding: '0px',
  },
}));

type CustomModalProps = {|
  onClose: () => void,
  title: string,
  confirmDRep: () => void,
  dividers?: boolean,
  width?: string,
  content: Node,
  actions: Node,
|};

export const CustomModal = (): Node => {
  const { height, width, closeModal, content, title, isOpen, isLoading } = useModal();

  return (
    <BootstrapDialog
      onClose={closeModal}
      aria-labelledby={`${title}-dialog-title`}
      open={isOpen}
      fullWidth
      width={width}
    >
      <DialogTitle sx={{ textAlign: 'center', p: '24px' }} id={`${title}-dialog-title`}>
        <Typography variant="body1" fontWeight="500">
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
          color: theme => theme.palette.ds.gray_c500,
        }}
      >
        <Icon.CloseIcon />
      </IconButton>
      <DialogContent>{content}</DialogContent>
    </BootstrapDialog>
  );
};
