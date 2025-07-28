import Dialog from '../../../../components/widgets/Dialog';
import { useIntl, defineMessages } from 'react-intl';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import LoadingSpinner from '../../../../components/widgets/LoadingSpinner';

const messages = defineMessages({
  claimDialogTitle: {
    id: 'airdrop.claimDialogTitle',
    defaultMessage: '!!!sign message',
  },
  ledgerClaimDialogTitle: {
    id: 'airdrop.ledgerClaimDialogTitle',
    defaultMessage: '!!!sign message { index } of { total }',
  },
  messageLabel: {
    id: 'airdrop.messageLabel',
    defaultMessage: '!!!Message',
  },
  ledgerClaimDialogText: {
    id: 'airdrop.ledgerClaimDialogText',
    defaultMessage: '!!!Signing this messages proves you have ownership of the address you want to use to claim NIGHT. Each message must be signed individually per address',
  },
});

export default function LedgerClaimDialog(props: {
  onClose: () => void,
  message: string,
  onClaim: (_password: string) => Promise<void>
}) {
  const intl = useIntl();

  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setClaiming] = useState(false);

  const onClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      await props.onClaim('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Dialog
      withCloseButton
      onClose={props.onClose}
      title={intl.formatMessage(messages.claimDialogTitle)}
      dialogActions={[
        {
          label: intl.formatMessage(messages.claimDialogTitle),
          primary: true,
          disabled: isClaiming,
          onClick: onClaim,
        },
      ]}
    >
      <Typography variant="body1" color="ds.text_gray_medium">
        {intl.formatMessage(messages.ledgerClaimDialogText)}
      </Typography>
      {isClaiming ? (
        <Box sx={{ marginTop: '16px', marginBottom: '16px' }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Box sx={{ height: '39px' }}></Box>
      )}
      <Typography variant="body1" color="ds.text_gray_low">
        {intl.formatMessage(messages.messageLabel)}
      </Typography>
      <Typography variant="body1" color="ds.text_gray_medium">
        {props.message}
      </Typography>
      <Typography component="div" variant="body2" color="ds.text_error">
        {error}
      </Typography>
    </Dialog>
  );
}
