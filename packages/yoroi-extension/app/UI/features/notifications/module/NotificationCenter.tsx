import { Box, IconButton, Drawer, Divider, styled, Stack, Typography, Button, ButtonBase } from '@mui/material';
import { Icon } from '../../../components';
import { useStrings } from '../common/hooks/useStrings';
import { useNotifications } from './NotificationsProvider';
import { appState, useModelValue, call } from '../../../../../api/frontEnd';
import { ReactComponent as NoNotificationIllustration } from '../../../../assets/images/revamp/no-open-orders.inline.svg';
import { useNavigate } from 'react-router';

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

const Notification = (props: { notification: (typeof appState.notifications.all)[number] }) => {
  const { notification } = props;
  const navigateTo = useNavigate();
  const { setIsNotificationCenterOpen } = useNotifications();
  const onNavigate = () => {
    if (!notification.redirection) {
      throw new Error('unexpectedly missing redirection in notification data');
    }
    navigateTo(notification.redirection);
    setIsNotificationCenterOpen(false);
    call(appState.notifications.setRead, notification.fcmMessageId);
  };

  const content = (
    <>
      <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium" textAlign="left">
        {notification.title}
      </Typography>
      {notification.body !== notification.title && (
        <Typography variant="body1" color="ds.text_gray_medium" textAlign="left">
          {notification.body}
        </Typography>
      )}
      {/* @ts-ignore */}
      <Typography variant="caption1" color="ds.text_gray_low">
        {new Date(notification.time).toLocaleString()}
      </Typography>
    </>
  );

  if (notification.redirection) {
    return (
      <ButtonBase sx={{ flexDirection: 'column', display: 'flex', alignItems: 'start' }} onClick={onNavigate}>
        {content}
      </ButtonBase>
    );
  }
  return <Box>{content}</Box>;
};

const NotificationList = () => {
  const strings = useStrings();
  const notifications = useModelValue(appState.notifications.all).value;

  if (notifications && notifications.length) {
    const hasUnread = notifications.find(n => !n.read);

    return (
      <>
        <Stack spacing="16px" sx={{ padding: '16px' }}>
          {notifications?.map(notification => (
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: '16px' }} key={notification.fcmMessageId}>
              <Box>
                <Icon.Notification />
              </Box>
              <Notification notification={notification} />
              <Box
                sx={{
                  height: '6px',
                  minWidth: '6px',
                  borderRadius: '50%',
                  backgroundColor: notification.read ? 'inherit' : 'ds.sys_magenta_500',
                  marginLeft: 'auto',
                  marginBottom: 'auto',
                }}
              />
            </Box>
          ))}
        </Stack>
        {hasUnread && (
          <Box sx={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
            <Divider />
            <Button
              // @ts-ignore
              variant="secondary"
              onClick={() => {
                call(appState.notifications.markAllRead);
              }}
              sx={{ margin: 'auto', marginTop: '16px', marginBottom: '16px' }}
            >
              {strings.readAll}
            </Button>
          </Box>
        )}
      </>
    );
  } else if (notifications) {
    // empty
    return (
      <Stack spacing="16px" sx={{ margin: 'auto' }}>
        <NoNotificationIllustration />
        {/* @ts-ignore */}
        <Typography variant="heading-3-regular" color="ds.text_gray_medium" sx={{ textAlign: 'center' }}>
          {strings.noNotification}
        </Typography>
      </Stack>
    );
  } else {
    // loading
    return null;
  }
};

export const NotificationCenter = () => {
  const strings = useStrings();
  const { isNotificationCenterOpen, setIsNotificationCenterOpen } = useNotifications();

  if (!isNotificationCenterOpen) {
    return null;
  }

  return (
    <StyledDrawer
      open
      anchor="right"
      onClose={() => {
        setIsNotificationCenterOpen(false);
      }}
    >
      <Stack direction="row" justifyContent="center">
        <Typography variant="button" my="24px" textAlign="center" id="notificationCenter-title-text">
          {strings.notificationCenterTitle}
        </Typography>
        <StyledButton
          onClick={() => {
            setIsNotificationCenterOpen(false);
          }}
          sx={{ right: '24px' }}
          id="notificationCenter-close-button"
        >
          <Icon.CloseIcon />
        </StyledButton>
      </Stack>
      <NotificationList />
    </StyledDrawer>
  );
};
