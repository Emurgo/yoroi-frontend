import React from 'react';
import { ToastContainer } from 'react-toastify'
import NotificationsStyles, { FadeInOut } from './NotificationsStyles';

export default function NotificationsManager() {
  // const { showRandomToast } = useNotifications();

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
      {/*{environment.isDev() && (*/}
      {/*  <Box sx={{ position: 'fixed', bottom: 10, left: 100, zIndex: 9999 }}>*/}
      {/*    <Button*/}
      {/*      variant='contained'*/}
      {/*      onClick={showRandomToast}*/}
      {/*    >*/}
      {/*      Create toast notification*/}
      {/*    </Button>*/}
      {/*  </Box>*/}
      {/*)}*/}
    </>
  )
}