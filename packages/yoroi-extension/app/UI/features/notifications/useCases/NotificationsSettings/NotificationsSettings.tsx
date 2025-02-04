import * as React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';
import LocalStorageApi from '../../../../../api/localStorage';
import { ampli } from '../../../../../../ampli';

const NotificationsSettings = ({ intl }) => {
  const strings = useStrings(intl);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)

  const lsApi = new LocalStorageApi();

  React.useEffect(() => {
    async function getNotifStatus() {
      const notifEnabled = await lsApi.getNotificationsSetting();
      if (notifEnabled === "true" && !notificationsEnabled) {
        setNotificationsEnabled(true);
      }
    }

    getNotifStatus();
  }, [])

  const handleNotificationsChange = (event) => {
    setNotificationsEnabled(prev => !prev);
    lsApi.setNotificationsSetting(String(event.target.checked));

    ampli.settingsInAppNotificationsStatusUpdated({
      status: event.target.checked ? "enabled" : "disabled"
    })
  }

  return (
    <Box mb="40px">
      <Box>
        <Typography variant='body1' fontWeight={500} color="ds.text_gray_medium">{strings.notifSettingsTitle}</Typography>
      </Box>
      <FormControlLabel
        label={strings.notifSettingsDesc}
        control={
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Switch
              checked={notificationsEnabled}
              onChange={handleNotificationsChange}
            />
          </Box>
        }
        labelPlacement="top"
        sx={{
          mt: '16px',
          marginLeft: '0px',
          color: 'ds.text_gray_medium',
          gap: '16px'
        }}
      />
    </Box>
  );
};

export default NotificationsSettings;