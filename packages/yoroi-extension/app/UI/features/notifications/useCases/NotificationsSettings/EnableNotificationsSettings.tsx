import { Box, FormControlLabel, Typography } from '@mui/material';
import { useStrings } from '../../common/hooks/useStrings';
import { Switch } from '../../../../components/Switch/Switch';

type Props = {
  isEnabled: boolean;
  permissionDenied: boolean;
  setEnabled: (enable: boolean) => Promise<void>;
};

export default function EnableNotificationsSettings({ isEnabled, permissionDenied, setEnabled }: Props) {
  const strings = useStrings();
  const enabled = isEnabled && !permissionDenied;

  return (
    <Box>
      <Box>
        <Typography variant="body1" fontWeight={500} color="ds.text_gray_medium">
          {strings.enablePushNotificationsTitle}
        </Typography>
      </Box>
      <FormControlLabel
        label={strings.enablePushNotificationsDesc}
        control={
          <Box sx={{ alignSelf: 'flex-start' }}>
            <Switch checked={enabled} onChange={() => setEnabled(!enabled)} />
          </Box>
        }
        labelPlacement="top"
        sx={{
          mt: '16px',
          marginLeft: '0px',
          color: 'ds.text_gray_medium',
          gap: '16px',
        }}
      />
      {permissionDenied && (
        <Typography color="ds.text_error" variant="caption" component="div">
          {strings.permissionDenied}
        </Typography>
      )}
    </Box>
  );
}
