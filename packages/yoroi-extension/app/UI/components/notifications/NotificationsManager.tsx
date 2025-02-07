import React from 'react';
import { Box, Button } from "@mui/material";
import NotificationToast, { NotificationProps } from "./NotificationToast";
import { NotificationTypes } from '../../types/notifications';
import { environment } from '../../../environment';

function getRandomNotification(clickFunction, closeFunction) {
  console.log("create random click");
  const notifTypes = [
    NotificationTypes.Rewards,
    NotificationTypes.Cancelled,
    NotificationTypes.Income,
    NotificationTypes.Outcome
  ];

  const randomIdx: number = Math.floor(Math.random() * notifTypes.length);
  const notifType: any = notifTypes[randomIdx] || notifTypes[0];

  return {
    id: String(Math.random()),
    type: notifType,
    onClick: clickFunction,
    onClose: closeFunction
  };
}

export default function NotificationsContainer() {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>([]);
  console.log("ntf", notifications)

  const handleNotificationClose = (notifId: string) => {
    console.log("closed", notifId);
    console.log([...notifications]);
    setNotifications(prev => prev.filter(n => n.id === notifId))
  }

  const handleNotificationClick = (notifId: string) => {
    console.log("clicked", notifId);
    setNotifications(prev => prev.filter(n => n.id === notifId))
  }


  return (
    <>
      <Box sx={{
        position: 'fixed',
        display: 'flex',
        flexFlow: 'column-reverse',
        top: 10,
        right: 10,
        zIndex: 9999,
        gap: '10px'
      }}>
        {notifications.slice(0, 3).map((notif) =>
          <NotificationToast {...notif} />
        )}
      </Box>
      {environment.isDev() && (
        <Box sx={{ position: 'fixed', top: 10, left: 100, zIndex: 9999 }}>
          <Button
            variant='contained'
            onClick={() => {
              const notif = getRandomNotification(
                handleNotificationClick,
                handleNotificationClose
              )
              setNotifications(prev => [...prev, notif])
            }}
          >
            Create toast notification
          </Button>
        </Box>
      )}
    </>
  )
}