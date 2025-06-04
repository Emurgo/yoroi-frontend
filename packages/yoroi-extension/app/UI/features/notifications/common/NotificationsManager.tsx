import { ToastContainer } from 'react-toastify'
import NotificationsStyles, { FadeInOut } from './NotificationsStyles';
/* import { useNotifications } from '../module/NotificationsProvider';
import { Box, Button } from '@mui/material';
import environment from '../../../../environment';
import { NotificationTypes } from '../../../types/notifications'; */

export default function NotificationsManager() {
  // const { createNotification } = useNotifications();

  return (
    <>
      <NotificationsStyles />
      <ToastContainer
        position="top-right"
        hideProgressBar={true}
        newestOnTop={true}
        transition={FadeInOut}
        pauseOnFocusLoss={false}
        pauseOnHover={true}
        closeButton={false}
        closeOnClick={false}
      />
      {/* {environment.isDev() && (
        <Box sx={{ position: 'fixed', bottom: 10, left: 100, zIndex: 9999 }}>
          <Button
            variant='contained'
            onClick={() => createNotification(NotificationTypes.Rewards)}
         >
            Create toast notification
          </Button>
      </Box>
      )} */}
    </>
  )
}