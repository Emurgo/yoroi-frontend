import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Box, Typography } from '@mui/material';
import globalMessages from '../../../../i18n/global-messages';
import { ReactComponent as Illustration } from '../../../../assets/images/transfer-success.inline.svg';

const messages = defineMessages({
  abortDialogTitle: {
    id: 'airdrop.abort.title',
    defaultMessage: '!!!no response',
  },
  abortDialogText1: {
    id: 'airdrop.abort.text1',
    defaultMessage: '!!!Loading is taking longer than expected',
  },
  abortDialogText2: {
    id: 'airdrop.abort.text2',
    defaultMessage: '!!!Do you want to continue the process?',
  },
});

export default function AbortDialog(props: Readonly<{ onClose: () => void; onContinue: () => void }>) {
  const { onClose, onContinue } = props;
  const intl = useIntl();

  return (
    <Dialog
      title={intl.formatMessage(messages.abortDialogTitle)}
      dialogActions={[
        {
          label: intl.formatMessage(globalMessages.close),
          onClick: onClose,
        },
        {
          label: intl.formatMessage(globalMessages.continue),
          primary: true,
          onClick: onContinue,
        },
      ]}
    >
      <Box sx={{ display: 'flex' }}>
        <Illustration style={{ margin: 'auto' }} />
      </Box>
      <Typography variant="h5" color="ds.text_gray_medium" textAlign="center">
        {intl.formatMessage(messages.abortDialogText1)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_low" textAlign="center">
        {intl.formatMessage(messages.abortDialogText2)}
      </Typography>
    </Dialog>
  );
}
