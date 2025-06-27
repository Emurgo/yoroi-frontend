import { Box, Button, Typography } from '@mui/material';
import Dialog from '../../../../../components/widgets/Dialog';
import Tabs from '../../../../../components/common/tabs/Tabs';
import { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import globalMessages from '../../../../../i18n/global-messages';

const messages = defineMessages({
  dialogTitle: {
    id: 'notifications.settings.duration.title',
    defaultMessage: '!!!Display duration',
  },
  line1: {
    id: 'notifications.settings.duration.line1',
    defaultMessage: '!!!Default display duration',
  },
  line2: {
    id: 'notifications.settings.duration.line2',
    defaultMessage: '!!!Adjust the display duration of in-app notifications to suit your preferences.',
  },
});

const defaultDurations = [2, 4, 6, 8, 10, 12].map(String);
const MAX_ALLOWED_DURATION = 60;

interface Props {
  onClose: () => void,
  initialDuration: number,
  onSetDuration: (duration: number) => void,
}

export default function NotificationDurationDialog({ onClose, initialDuration, onSetDuration }: Props) {
  const intl = useIntl();
  const [isManual, setIsManual] = useState(!defaultDurations.includes(String(initialDuration)));
  const [currentDuration, setCurrentDuration] = useState<string>(String(initialDuration));
  const [inputFocused, setInputFocused] = useState(false);
  const readonly = !isManual;

  return (
    <Dialog
      title={intl.formatMessage(messages.dialogTitle)}
      onClose={onClose}
      withCloseButton
      closeOnOverlayClick
      styleContentOverride={{ paddingTop: '16px' }}
      styleOverride={{ minWidth: '612px', height: '540px', maxWidth: '612px' }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ bg: 'ds.bg_color_max' }}>
          <Typography component="div" variant="body1" color="ds.text_gray_medium">
            {intl.formatMessage(messages.line1)}
          </Typography>
        </Box>
        <Box pb="16px" pt="8px">
          <Typography component="div" variant="body2" color="ds.text_gray_low">
            {intl.formatMessage(messages.line2)}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-start">
          <Tabs
            tabs={defaultDurations
              .map(val => ({
                label: `${val}s`,
                isActive: !isManual && val === currentDuration,
                onClick: () => {
                  setIsManual(false);
                  setCurrentDuration(val);
                },
              }))
              .concat({
                label: intl.formatMessage(globalMessages.manual),
                isActive: isManual,
                onClick: () => {
                  setIsManual(true);
                },
              })}
          />
        </Box>
        <Box
          my="16px"
          component="fieldset"
          sx={{
            border: inputFocused && !readonly ? '2px solid' : '1px solid',
            borderColor: inputFocused && !readonly ? 'ds.el_gray_max' : 'grayscale.400',
            borderRadius: '8px',
            p: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            justifyContent: 'start',
            position: 'relative',
            bgcolor: readonly ? 'ds.bg_color_contrast_min' : 'ds.bg_color_max',
            columnGap: '6px',
            rowGap: '8px',
            ...(!inputFocused &&
              !readonly && {
                '&:hover': {
                  border: '1px solid',
                  borderColor: 'ds.el_gray_max',
                },
              }),
            maxHeight: '56px',
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
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
            {intl.formatMessage(messages.dialogTitle)}
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
            onChange={event => setCurrentDuration(event.target.value)}
            bgcolor={readonly ? 'ds.bg_color_contrast_min' : 'ds.bg_color_max'}
            readOnly={readonly}
            value={currentDuration}
          />
        </Box>

        <Button
          sx={{ marginTop: 'auto' }}
          disabled={!/^[1-9]\d*(\.\d+)?$/.test(currentDuration) || Number(currentDuration) > MAX_ALLOWED_DURATION}
          fullWidth
          onClick={() => onSetDuration(Number(currentDuration)) }
          variant="contained"
        >
          {intl.formatMessage(globalMessages.apply)}
        </Button>

      </Box>
    </Dialog>
  );
}
