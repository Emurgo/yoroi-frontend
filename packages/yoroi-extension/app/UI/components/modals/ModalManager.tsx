import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { IconWrapper, Icons } from '../icons/index';
import { useModal } from './ModalContext';

const BootstrapDialog: any = styled(Dialog)(({ theme, width, height }: { width: string; height: string; theme: any }) => ({
  '& .MuiDialogContent-root': {
    padding: '0 24px',
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
  const { height, width, closeModal, onClose, content, title, isOpen, modalId } = useModal();

  const modalOnClose = () => {
    if (typeof onClose === 'function') onClose();
    closeModal();
  }

  return (
    <BootstrapDialog
      onClose={modalOnClose}
      aria-labelledby={`${modalId}-dialogWindow-modalWindow`}
      open={isOpen}
      fullWidth
      width={width}
      height={height}
      id={`${modalId}-dialogWindow-presentation`}
    >
      <DialogTitle sx={{ textAlign: 'center', p: '24px', backgroundColor: 'ds.bg_color_max' }} id={`${modalId}-modalTitle-text`}>
        <Typography variant="body1" fontWeight="500" lineHeight="22px" color="ds.gray_900" sx={{ textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </DialogTitle>
      <IconWrapper
        aria-label="close"
        onClick={modalOnClose}
        icon={Icons.CloseIcon}
        color="ds.el_gray_max"
        borderColor="ds.el_gray_max"
        asButton
        buttonProps={{
          sx: {
            position: 'absolute',
            right: 18,
            top: 22,
          },
        }}
        iconButtonId={`${modalId}-closeModal-crossIconbutton`}
      />
      <DialogContent>{content}</DialogContent>
    </BootstrapDialog>
  );
};
