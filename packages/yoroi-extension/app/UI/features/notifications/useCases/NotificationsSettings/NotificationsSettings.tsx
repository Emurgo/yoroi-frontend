import * as React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';
import LocalStorageApi from '../../../../../api/localStorage';
import { ampli } from '../../../../../../ampli';
import { noop } from '../../../../../coreUtils'

type Props = {
  selectedWalletId: number;
}

const NotificationsSettings = ({ selectedWalletId }: Props) => {
  const strings = useStrings();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const lsApi = new LocalStorageApi();

  async function getNotificationsSetting() {
    const notifSettingsStr = await lsApi.getNotificationsSetting();
    return JSON.parse(notifSettingsStr ?? '{}');
  }

  async function setNotificationsSetting(enabled: boolean) {
    const notifSettings = await getNotificationsSetting();
    const newState = JSON.stringify({ ...notifSettings, [selectedWalletId]: enabled });
    await lsApi.setNotificationsSetting(newState);
  }

  // get initial state from localstorage
  React.useEffect(() => {
    async function initialNotifStatus() {
      const notifSettings = await getNotificationsSetting();
      const notifEnabled = notifSettings[selectedWalletId] ?? true;
      setNotificationsEnabled(notifEnabled);
    }
    // eslint-disable-next-line
    noop(initialNotifStatus());
  }, [])

  // handle checkbox change event
  const handleNotificationsChange = async (event) => {
    const enabled = event.target.checked;
    setNotificationsEnabled(enabled);
    await setNotificationsSetting(enabled);
    // noinspection TypeScriptUnresolvedFunction
    ampli.settingsInAppNotificationsStatusUpdated({
      status: event.target.checked ? 'enabled' : 'disabled'
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