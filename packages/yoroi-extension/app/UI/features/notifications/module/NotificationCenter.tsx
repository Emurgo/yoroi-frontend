import * as React from 'react';
import { IconButton, Drawer, styled, Stack, Typography } from '@mui/material';
import { Icon } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';
import { useNotifications } from './NotificationsProvider';

const StyledDrawer = styled(Drawer)(({ theme }: any) => ({
  '& .MuiDrawer-paper': {
    width: '530px',
    background: theme.palette.ds.bg_color_contrast_high,
  },
  zIndex: '9999',
}));

const StyledButton = styled(IconButton)(({ theme }: any) => ({
  position: 'absolute',

  top: '20px',
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

export const NotificationCenter = () => {
  const strings = useStrings();
  const { isNotificationCenterOpen, setNotificationCenterOpen } = useNotifications();

  const toggleDrawer = (anchor: string, open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    return
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
    closeTxReviewModal();
  };

  if (!isNotificationCenterOpen) {
    return null;
  }

  return (
    <>
      <StyledDrawer open={true} onClose={toggleDrawer('right', false)} anchor={'right'} >
        <Stack direction="row" justifyContent="center">
          <Typography variant="button" my="24px" textAlign="center" id='notificationCenter-title-text'>
            {strings.notificationCenterTitle}
          </Typography>
          <StyledButton onClick={() => { setNotificationCenterOpen(false) }} sx={{ right: '24px' }} id='notificationCenter-close-button'>
            <Icon.CloseIcon />
          </StyledButton>
        </Stack>
      </StyledDrawer>
    </>
  );  
}
