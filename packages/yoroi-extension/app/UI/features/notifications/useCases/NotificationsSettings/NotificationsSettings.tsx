import * as React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';
import LocalStorageApi from '../../../../../api/localStorage'

const NotificationsSettings = ({ intl }) => {
  const strings = useStrings(intl);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [selectedWalletId, setSelectedWalletId] = React.useState("");

  const lsApi = new LocalStorageApi();

  async function getNotificationsSetting(checkCurrentWallet: boolean = false) {
    const notifSettingsStr = await lsApi.getNotificationsSetting();
    const notifSettings = JSON.parse(notifSettingsStr || "{}");

    if (checkCurrentWallet) {
      const selectedWalletId = await lsApi.getSelectedWalletId();
      setSelectedWalletId(selectedWalletId);

      return notifSettings[selectedWalletId] !== undefined ? notifSettings[selectedWalletId] : true;
    }

    return notifSettings;
  }

  async function setNotificationsSetting(enabled: boolean) {
    const notifSettings = await getNotificationsSetting();
    lsApi.setNotificationsSetting(JSON.stringify({ ...notifSettings, [selectedWalletId]: enabled }));
  }

  // get initial state from localstorage
  React.useEffect(() => {
    async function initialNotifStatus() {
      const notifEnabled = await getNotificationsSetting(true);
      setNotificationsEnabled(notifEnabled);
    }

    initialNotifStatus();
  }, [])

  // handle checkbox change event
  const handleNotificationsChange = async (event) => {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    setNotificationsSetting(enabled);
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