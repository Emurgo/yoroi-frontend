import React from 'react';
import { Box, Button } from "@mui/material";
import { NotificationCloseButton, createToast } from "./NotificationToast";
import { NotificationTypes } from '../../types/notifications';
import { environment } from '../../../environment';
import { toast, ToastContainer } from 'react-toastify'
import { useStrings } from '../../common/hooks/useStrings';
import NotificationsStyles from './NotificationsStyles';
import LocalStorageApi from '../../../api/localStorage';

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

export default function NotificationsManager({ intl = undefined }) {
  const lsApi = new LocalStorageApi();
  const [toastQueue, setToastQueue] = React.useState<any>([]);
  const strings = useStrings(intl);
  const notificationTexts = {
    [NotificationTypes.Rewards]: strings.stakingRewardsReceived,
    [NotificationTypes.Income]: strings.tokensReceived,
    [NotificationTypes.Outcome]: strings.tokensSent,
    [NotificationTypes.Cancelled]: strings.txFailed,
  }

  const showToast = async () => {
    const notif = getRandomNotification(console.log, console.log);
    const theme = await lsApi.getUserThemeMode();

    // Remove the oldest toast if more than 3 exist
    if (toastQueue.length >= 3) {
      toast.dismiss(toastQueue[0]);
      setToastQueue((prev) => prev.slice(1));
    }

    const id = createToast({
      ...notif,
      title: notificationTexts[notif.type],
      subtitle: strings.clickToView,
      theme
    });

    setToastQueue((prev) => [...prev, id]);
  };

  const handleToastChanges = (data) => {
    console.log(data)
  }

  React.useEffect(() => {
    toast.onChange(handleToastChanges)
  }, [])

  return (
    <>
      <NotificationsStyles />
      <ToastContainer
        position="top-right"
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        pauseOnHover={true}
        limit={3}
        closeButton={(props) => <NotificationCloseButton {...props} />}
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