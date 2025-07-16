import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';

type Props = {
  isEnabled: boolean,
  toggle: () => void,
}

export default function EnableNotificationsSettings({isEnabled, toggle}: Props) {
  const strings = useStrings();

  return (
    <Box>
      <Box>
        <Typography variant='body1' fontWeight={500} color="ds.text_gray_medium">{strings.enablePushNotificationsTitle}</Typography>
      </Box>
      <FormControlLabel
        label={strings.enablePushNotificationsDesc}
        control={
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Switch
              checked={isEnabled}
              onChange={toggle}
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
}
