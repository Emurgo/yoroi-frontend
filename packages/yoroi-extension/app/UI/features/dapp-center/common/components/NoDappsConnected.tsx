import { Typography , Box } from '@mui/material';
import { useIntl } from '../../../../context/IntlProvider';
import { connectorMessages } from '../../../../../i18n/global-messages';
import { defineMessages } from 'react-intl';
import { NoDappsConnected as NoDappsConnectedIllustration } from '../../../../components/ilustrations';

const messages = defineMessages({
  noWebsitesConnected: {
    id: 'connector.connect.noWebsitesConnected',
    defaultMessage: "!!!You don't have any websites connected yet",
  },
});

export default function NoDappsConnected() {
  const { intl } = useIntl();
  return (
    <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="center">
      <Box mt="-24px" display="flex" flexDirection="column" alignItems="center" gap="16px">
        <NoDappsConnectedIllustration />
        <Box textAlign="center">
          <Typography variant="h5" fontWeight={500} mb="8px" color="ds.text_gray_medium">
            {intl.formatMessage(messages.noWebsitesConnected)}
          </Typography>
          <Typography variant="body1" color="ds.text_gray_low">
            {intl.formatMessage(connectorMessages.messageReadOnly)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
