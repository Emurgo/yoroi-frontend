import { Box, IconButton, Drawer, Divider, styled, Stack, Typography, Button } from '@mui/material';
import { Icon } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';
import { useNotifications } from './NotificationsProvider';
import { appState, useModelValue, call } from '../../../../../api/frontEnd';
import { ReactComponent as NoNotificationIllustration } from '../../../../assets/images/revamp/no-open-orders.inline.svg';

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
  const notifications = useModelValue(appState.notifications.all).value?.filter(notification => !notification.read);

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
        {notifications && notifications.length ? (
          <>
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
            <Box sx={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
              <Divider />
              <Button
                variant="secondary"
                onClick={() => { call(appState.notifications.markAllRead) }}
                sx={{ margin: 'auto', marginTop: '16px', marginBottom: '16px' }}
              >
                {strings.readAll}
              </Button>
            </Box>
          </>
        ) : notifications ? (
          // empty
          <Stack spacing="16px" sx={{ margin: 'auto' }}>
            <NoNotificationIllustration />
            <Typography variant="heading-3-regular" color="ds.text_gray_medium" sx={{ textAlign: 'center' }}>
              {strings.noNotification}
            </Typography>
          </Stack>
        ) : (
          // loading
          null
        )}
      </StyledDrawer>
    </>
  );  
}
