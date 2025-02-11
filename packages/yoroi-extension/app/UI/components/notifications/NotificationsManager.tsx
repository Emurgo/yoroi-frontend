import React from 'react';
import { Box, Button, Typography } from "@mui/material";
import { CloseNotificationButton, createToast } from "./NotificationToast";
import { NotificationTypes } from '../../types/notifications';
import { environment } from '../../../environment';
import { toast, ToastContainer } from 'react-toastify'
import { useStrings } from '../../common/hooks/useStrings';
import NotificationsContainer from './NotificationsContainer';

function getRandomNotification(clickFunction, closeFunction) {
  const notifTypes = [
    NotificationTypes.Rewards,
    NotificationTypes.Cancelled,
    NotificationTypes.Income,
    NotificationTypes.Outcome
  ];

  const randomIdx: number = Math.floor(Math.random() * notifTypes.length);
  const notifType: any = notifTypes[randomIdx] || notifTypes[0];

  return {
    type: notifType,
    onClick: clickFunction,
    onClose: closeFunction
  };
}

export default function NotificationsManager() {
  const [toastQueue, setToastQueue] = React.useState<any>([]);
  const strings = useStrings();
  const notificationTexts = {
    [NotificationTypes.Rewards]: strings.stakingRewardsReceived,
    [NotificationTypes.Income]: strings.tokensReceived,
    [NotificationTypes.Outcome]: strings.tokensSent,
    [NotificationTypes.Cancelled]: strings.txFailed,
  }


  const showToast = () => {
    const notif = getRandomNotification(console.log, console.log);

    // Remove the oldest toast if more than 3 exist
    if (toastQueue.length >= 3) {
      toast.dismiss(toastQueue[0]);
      setToastQueue((prev) => prev.slice(1));
    }

    const id = createToast({
      ...notif, title: (
        <Box sx={{ flexGrow: 1, cursor: "pointer" }}>
          <Typography mb="2px" component="div" variant="body1" fontWeight={500} color="ds.text_gray_medium">{notificationTexts[notif.type]}</Typography>
          <Typography component="div" variant='body2' color="ds.text_gray_low">{strings.clickToView}</Typography>
        </Box>
      )
    });

    setToastQueue((prev) => [...prev, id]);
  };


  return (
    <>
      <NotificationsContainer />
      <ToastContainer
        position="top-right"
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={true}
        limit={3}
        closeButton={(props) => <CloseNotificationButton {...props} />}
      />
      {environment.isDev() && (
        <Box sx={{ position: 'fixed', bottom: 10, left: 100, zIndex: 9999 }}>
          <Button
            variant='contained'
            onClick={showToast}
          >
            Create toast notification
          </Button>
        </Box>
      )}
    </>
  )
}