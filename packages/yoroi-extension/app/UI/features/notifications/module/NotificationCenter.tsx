import { Box, IconButton, Drawer, styled, Stack, Typography, Button } from '@mui/material';
import { Icon } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';
import { useNotifications } from './NotificationsProvider';
import { appState, useModelValue } from '../../../../../api/frontEnd';

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
  const notifications = useModelValue(appState.notifications.all).value;

  if (!isNotificationCenterOpen) {
    return null;
  }

  return (
    <>
      <StyledDrawer open anchor="right" >
        <Stack direction="row" justifyContent="center">
          <Typography variant="button" my="24px" textAlign="center" id='notificationCenter-title-text'>
            {strings.notificationCenterTitle}
          </Typography>
          <StyledButton onClick={() => { setNotificationCenterOpen(false) }} sx={{ right: '24px' }} id='notificationCenter-close-button'>
            <Icon.CloseIcon />
          </StyledButton>
        </Stack>
        <Stack spacing="16px" sx={{ padding: '16px' }}>
          {notifications?.map((notification) => (
            <Stack direction="row" spacing="16px">
              <Box>
                <Icon.Notification />
              </Box>
              <Box>
                <Typography variant="body1" color="ds.text_gray_medium">
                  {notification.body}
                </Typography>
                <Typography variant="caption1" color="ds.text_gray_low">
                  {(new Date(notification.time)).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
        <Box sx={{ borderTop: '1px', marginTop: 'auto', padding: '16px', display: 'flex' }}>
          <Button
            variant="secondary"
            onClick={() => {}}
            sx={{ margin: 'auto' }}
          >
            {strings.readAll}
          </Button>
        </Box>
      </StyledDrawer>
    </>
  );  
}
