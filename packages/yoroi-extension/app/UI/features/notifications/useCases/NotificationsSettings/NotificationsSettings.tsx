import * as React from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';
import LocalStorageApi from '../../../../../api/localStorage';
import { ampli } from '../../../../../../ampli';
import { noop } from '../../../../../coreUtils'

type Props = {
  selectedWalletId: number;
  openDurationDialog: () => void;
  duration: number;
}

const NotificationsSettings = ({ openDurationDialog, selectedWalletId, duration }: Props) => {
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

      <Box
        component="fieldset"
        sx={{
          border: '1px solid',
          borderColor: 'grayscale.400',
          borderRadius: '8px',
          p: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          justifyContent: 'start',
          position: 'relative',
          bgcolor: 'ds.bg_color_max',
          columnGap: '6px',
          rowGap: '8px',
          maxHeight: '56px',
          width: '506px', /* to be consistent with components/wallet/settings/WalletNameSetting.js */
          mt: '24px',
        }}
      >
        <Box
          component="legend"
          sx={{
            top: '-7px',
            left: '16px',
            position: 'absolute',
            px: '4px',
            bgcolor: 'ds.bg_color_max',
            color: 'ds.text_gray_medium',
          }}
        >
          {strings.duration}
        </Box>

        <Typography
          sx={{
            appearance: 'none',
            border: '0',
            outline: 'none',
            '::placeholder': { color: 'grayscale.600' },
          }}
          component="input"
          type="text"
          variant="body1"
          color="ds.text_gray_medium"
          placeholder="0"
          bgcolor="ds.bg_color_max"
          value={strings.durationDescription(duration)}
          onClick={(event) => {
            event.currentTarget.blur();
            openDurationDialog();
          }}
        />
      </Box>

    </Box>
  );
};

export default NotificationsSettings;